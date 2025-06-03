import { splitRunsIntoLines } from './runs.js'

import {
  Line, MeasureMetrics, MeasureRunAscent, MeasureRunBounds, MeasureRunWidth, TextRun
} from './types.js'

import { runsToWords } from './words.js'

// generates hard wrapped lines from runs
export const runsToLines = (
  measureText: MeasureRunWidth | MeasureMetrics
) => {
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

      const firstWord = words[0]
      const lastWord = words[words.length - 1]

      if (firstWord.opticalLeft !== undefined) {
        line.opticalLeft = firstWord.opticalLeft
      }

      if (lastWord.opticalRight !== undefined) {
        line.opticalRight = lastWord.opticalRight
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

export const opticalLineAscent = (line: Line) => {
  let maxAscent: number | null = null

  for (const word of line.words) {
    for (const run of word.runs) {
      if (run.actualBoundingBoxAscent !== undefined) {
        if (maxAscent === null) {
          maxAscent = run.actualBoundingBoxAscent
        } else {
          maxAscent = Math.max(maxAscent, run.actualBoundingBoxAscent)
        }
      }
    }
  }

  return maxAscent
}