import { Align, DrawRun, WrappedBlock } from './types.js'

export const drawBlock = (drawRun: DrawRun) =>
  (block: WrappedBlock, x = 0, y = 0) => {
    let cx = x
    let cy = y

    for (const line of block.lines) {
      for (const word of line.words) {
        for (const run of word.runs) {
          drawRun(run, cx, cy, word, line, block)

          cx += run.advanceX
        }
      }

      cx = x
      cy += line.height
    }
  }

export const drawRunAligned = (baseDrawRun: DrawRun, align: Align): DrawRun =>
  (run, x, y, word, line, block) => {
    const dx = align === 'center' ? (block.maxWidth - line.width) / 2 :
      align === 'right' ? block.maxWidth - line.width : 0

    baseDrawRun(run, x + dx, y, word, line, block)
  }
