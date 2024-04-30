import { splitRunsIntoLines } from './runs.js'
import { Line, MeasureRunAscent, MeasureRunWidth, TextRun } from './types.js'
import { runsToWords } from './words.js'

// generates hard wrapped lines from runs
export const runsToLines = (measureText: MeasureRunWidth) => {
  const rtw = runsToWords(measureText)

  const rtl = (runs: TextRun[]) => {
    // handle hard breaks and split into words
    const runLines = splitRunsIntoLines(runs)

    const lines: Line[] = []

    for (const rl of runLines) {
      const words = rtw(rl)

      const line: Line = {
        words,
        width: 0,
        height: 0
      }

      for (const word of words) {
        line.width += word.advanceX
        line.height = Math.max(line.height, word.height)
      }

      lines.push(line)
    }

    return lines
  }

  return rtl
}

// find the maximum ascent of the words in a line
export const lineAscent = (measureAscent: MeasureRunAscent) =>
  (line: Line) => {
    let maxAscent = 0

    for (const word of line.words) {
      for (const run of word.runs) {
        maxAscent = Math.max(maxAscent, measureAscent(run))
      }
    }

    return maxAscent
  }
