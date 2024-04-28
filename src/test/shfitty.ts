import { blockScaler } from '../scale.js'
import { Block, Size } from '../types.js'
import { softWrapper } from '../wrap.js'

type Fit = 'CLOSE_FIT' | 'UNDERSIZED' | 'OVERSIZED'

// are we likely to use the same bounds on different blocks? yes I think we are
// so probably should be a higher order function here where 
// bounds => block => scale
export const shfitty = (block: Block, bounds: Size) => {
  const wrap = softWrapper(bounds.width)

  // consider making the tolerance (here, 1) an option
  const closeToBounds = {
    width: bounds.width - 1,
    height: bounds.height - 1
  }

  const getFit = (scale: number): Fit => {
    const scaler = blockScaler(scale)
    const scaledBlock = scaler(block)
    const wrappedBlock = wrap(scaledBlock)

    if (
      wrappedBlock.height > bounds.height
    ) {
      return 'OVERSIZED'
    } else if (
      wrappedBlock.height < closeToBounds.height
    ) {
      return 'UNDERSIZED'
    }

    return 'CLOSE_FIT'
  }

  let scale = 1
  let lowerBound = 0
  let upperBound = 0

  // Find initial bounds
  let fit = getFit(scale)

  // a miracle
  if (fit === 'CLOSE_FIT') {
    return { closeFitScale: scale }
  }
  
  // experiment to see if using factors other than 2/0.5 are faster overall
  // also experiment to see if this is necessary at all (I think it is...)
  if (fit === 'UNDERSIZED') {
    lowerBound = scale
    do {
      scale *= 2
      fit = getFit(scale)
    } while (fit !== 'OVERSIZED')
    upperBound = scale
  } else { // OVERSIZED
    upperBound = scale
    do {
      scale /= 2
      fit = getFit(scale)
    } while (fit !== 'UNDERSIZED')
    lowerBound = scale
  }

  let midScale = (lowerBound + upperBound) / 2
  let midFit = getFit(midScale)

  // perhaps make this an option
  const maxIterations = 1e4
  let iterations = 0

  while (midFit !== 'CLOSE_FIT') {
    if (midFit === 'UNDERSIZED') {
      lowerBound = midScale
    } else {
      upperBound = midScale
    }

    midScale = (lowerBound + upperBound) / 2
    midFit = getFit(midScale)

    iterations++

    if (iterations > maxIterations) {
      throw Error('shfitty failed to find a fit')
    }
  }

  return { closeFitScale: midScale }
}
