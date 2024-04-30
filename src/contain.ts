import { blockScaler } from './scale.js'
import { Block, Size, WrappedBlock } from './types.js'

// scale the existing block to fit the bounds without affecting existing 
// wrapping
export const containFit = (bounds: Size) =>
  (block: Block | WrappedBlock) => {
    const scaleW = bounds.width / block.width
    const scaleH = bounds.height / block.height

    const scale = Math.min(scaleW, scaleH)
    const scaled = blockScaler(scale)(block)

    const contained: WrappedBlock = {
      ...scaled,
      maxWidth: bounds.width
    }

    return contained
  }
