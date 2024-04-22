import { groupWords, measuredRun, splitRunsOnSpaces } from './runs.js'
import { MeasureRunWidth, TextRun, Word } from './types.js'

export const runsToWords = (measureText: MeasureRunWidth) => {
  const mr = measuredRun(measureText)

  const rtw = (runs: TextRun[]) => {
    const withSpaces = splitRunsOnSpaces(runs)
    const wordGroups = groupWords(withSpaces)

    const words: Word[] = []

    for (const wg of wordGroups) {
      const measuredRuns = wg.map(mr)

      const word: Word = {
        runs: measuredRuns,
        width: 0,
        advanceX: 0,
        height: 0
      }

      for (let i = 0; i < measuredRuns.length; i++) {
        const run = measuredRuns[i]

        word.width += run.width
        word.advanceX += run.advanceX
        word.height = Math.max(word.height, run.height)
      }

      words.push(word)
    }

    return words
  }

  return rtw
}
