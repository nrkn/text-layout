import { groupWords, measuredRun, splitRunsOnSpaces } from './runs.js'
import { Block, Line, MeasureRunWidth, TextRun, Word } from './types.js'

// split the runs on spaces and generate words (unbreakable runs)
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

export const emptyWord = (): Word => ({
  runs: [],
  width: 0,
  advanceX: 0,
  height: 0
})

// find the longest word in a line
export const longestWordInLine = (line: Line) =>
  line.words.reduce(
    (longest, word) =>
      word.width > longest.width ? word : longest,
    line.words[0] || emptyWord()
  )

// find the longest word in a block  
export const longestWordInBlock = (block: Block) =>
  block.lines.reduce(
    (longest, line) => {
      const lw = longestWordInLine(line)

      return lw.width > longest.width ? lw : longest
    },
    block.lines[0].words[0] || emptyWord()
  )