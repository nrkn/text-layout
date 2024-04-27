import { scaleBlock } from '../scale.js'
import { Block, Size } from '../types.js'
import { softWrapper } from '../wrap.js'

type Fit = 'CLOSE_FIT' | 'UNDERSIZED' | 'OVERSIZED'

export const shfitty = (block: Block, bounds: Size) => {
  const wrap = softWrapper(bounds.width)

  const closeToBounds = {
    width: bounds.width - 1,
    height: bounds.height - 1
  }

  const getFit = (scale: number): Fit => {
    const scaler = scaleBlock(scale)
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

  console.log({ lowerBound, upperBound })

  let midScale = (lowerBound + upperBound) / 2
  let midFit = getFit(midScale)

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

  console.log({ iterations })

  return { closeFitScale: midScale }
}
