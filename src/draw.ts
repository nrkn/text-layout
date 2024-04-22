import { Block, DrawRun } from './types.js'

export const drawBlock = (drawRun: DrawRun) =>
  (block: Block, x = 0, y = 0) => {
    let cx = x
    let cy = y

    for (const line of block.lines) {
      for (const word of line.words) {
        for (const run of word.runs) {
          drawRun(run, cx, cy)
          
          cx += run.advanceX
        }
      }

      cx = x
      cy += line.height
    }
  }
