import { longestWordInBlock } from './words.js'
import { blockScaler } from './scale.js'

import {
  Block, FailedFit, FitFoundDuring, FitResult, FitterOptions, Size,
  WrappedBlock
} from './types.js'

import { softWrapper } from './wrap.js'
import { opticalLineAscent } from './lines.js'

// pretty good, pretty fast fitter - adjusts scale, rewrapping text at each
// new scale until either it finds a close fit to the height, or the widest 
// unbreakable word can't be scaled up any further. Optionally, only shrink the
// text to fit but don't grow if it already fits. If a close fit isn't possible
// it is detected by the lower and upper bounds converging to a small delta
// and a best attempt is returned instead.
export const fitter = (bounds: Size, options: Partial<FitterOptions> = {}) => {
  const {
    tolerance, scaleStep, maxIterations, minBoundsDelta, fitType, wrapper,
    cropToMetrics = false
  } = Object.assign(defaultFitterOptions(), options)

  assertOptions(tolerance, scaleStep)

  const wrap = wrapper(bounds.width)

  const closeW = bounds.width - tolerance
  const closeH = bounds.height - tolerance

  const fitBlock = (block: Block) => {
    let scale = 1
    let lowerBound = 0
    let upperBound = 0
    let iterations = 0
    let wrapped: WrappedBlock

    // try to either fit the longest unbreakable word, or to fit the bound 
    // height, or return why it failed
    const attemptFit = (scale: number, during: FitFoundDuring): Attempt => {
      iterations++

      const scaledBlock = blockScaler(scale)(block)

      wrapped = wrap(scaledBlock)

      let wrappedHeight = wrapped.height

      if( wrapped.lines.length > 0 && cropToMetrics ){
        const firstLine = wrapped.lines[0]
        const ascent = opticalLineAscent(firstLine)

        if( ascent !== null ){
          const delta = firstLine.height - ascent
          
          wrappedHeight -= delta
        }
      }

      if (iterations > maxIterations) {
        throw Error(`Exceeded max iterations (${maxIterations})`)
      }

      const longestWord = longestWordInBlock(wrapped)

      // unbreakable word that exceeds bounds 
      if (longestWord.width > bounds.width) {
        return fitnessOver
      }

      // the word has been reduced to fit the width, and the height is within
      // bounds, this is the best we can manage with such a long word
      if (longestWord.width >= closeW && wrappedHeight <= bounds.height) {
        return {
          wrapped,
          bounds: { width: bounds.width, height: bounds.height },
          strategy: 'widest word',
          scale,
          iterations,
          foundDuring: during
        }
      }
      // otherwise, we need to check the height
      if (wrappedHeight > bounds.height) {
        return fitnessOver
      } else if (wrappedHeight < closeH) {
        return fitnessUnder
      }

      // great - found a close fit
      return {
        wrapped,
        bounds: { width: bounds.width, height: bounds.height },
        strategy: 'height',
        scale,
        iterations,
        foundDuring: during
      }
    }

    // Find initial bounds
    let fit = attemptFit(scale, 'initial')

    // if fitType is shrink, only continue if we are over sized
    if (fitType === 'shrink' && fit === fitnessUnder) return {
      wrapped: wrapped!,
      bounds: { width: bounds.width, height: bounds.height },
      strategy: 'shrink',
      scale,
      iterations,
      foundDuring: 'initial'
    }

    // found it during the initial fit at scale 1
    if (isFitResult(fit)) return fit

    // estimate the starting scale
    const boundsArea = bounds.width * bounds.height
    const wrappedArea = wrapped!.width * wrapped!.height

    scale = Math.sqrt(boundsArea / wrappedArea)

    // Find estimated
    fit = attemptFit(scale, 'estimate')

    // found it during the estimate
    if (isFitResult(fit)) return fit

    // find approx upper and lower bounds - we need this because we have no 
    // robust way to guess what they are, the user could easily pass in a text 
    // that needs to be scaled outside of our guess
    if (fit === fitnessUnder) {
      lowerBound = scale
      do {
        scale *= scaleStep
        fit = attemptFit(scale, 'upper bound search')

        // found it while searching for the upper bound
        if (isFitResult(fit)) return fit
      } while (fit !== fitnessOver)

      upperBound = scale
    } else {
      upperBound = scale
      do {
        scale /= scaleStep
        fit = attemptFit(scale, 'lower bound search')

        // found it while searching for the lower bound
        if (isFitResult(fit)) return fit
      } while (fit !== fitnessUnder)

      lowerBound = scale
    }

    let midScale = (lowerBound + upperBound) / 2
    fit = attemptFit(midScale, 'mid scale')

    // found it while setting the mid scale
    if (isFitResult(fit)) return fit

    // binary search to find the right scale
    // while( true ) seems scary, but we will either find the fit and return, 
    // or attemptFit will throw at max iterations
    while (true) {
      if (fit === fitnessUnder) {
        lowerBound = midScale

        const boundsDelta = upperBound - lowerBound

        // ok - need to handle the case where the delta between upper and lower 
        // is really small, it means that no close fit is possible - better for 
        // it to be under
        if (boundsDelta < minBoundsDelta) {
          return {
            wrapped: wrapped!,
            bounds: { width: bounds.width, height: bounds.height },
            strategy: 'no close fit',
            scale,
            iterations,
            foundDuring: 'lower/upper delta check'
          }
        }

      } else if (fit === fitnessOver) {
        upperBound = midScale
      }

      midScale = (lowerBound + upperBound) / 2
      fit = attemptFit(midScale, 'binary search')

      // found during binary search
      if (isFitResult(fit)) return fit
    }
  }

  return fitBlock
}

export const fitnessOver: FailedFit = 'over'
export const fitnessUnder: FailedFit = 'under'

export const defaultFitterOptions = (): FitterOptions => ({
  tolerance: 1,
  scaleStep: 2,
  maxIterations: 100,
  fitType: 'fit',
  minBoundsDelta: 1e-6,
  // you can override the soft wrapper
  // the idea being that we can provide a new wrapper later
  // that makes better use of font metrics
  wrapper: softWrapper
})

type Attempt = FailedFit | FitResult

const isFitResult = (attempt: Attempt): attempt is FitResult =>
  typeof attempt !== 'string'

const assertOptions = (tolerance: number, scaleStep: number) => {
  const errors: string[] = []

  if (tolerance <= 0) errors.push(`Tolerance must be > 0, saw ${tolerance}`)
  if (scaleStep <= 1) errors.push(`Scale step must be > 1, saw ${scaleStep}`)

  if (errors.length > 0) throw Error(errors.join(', '))
}
