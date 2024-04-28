import { Block, Line, MeasuredRun, Word } from './types.js'

export const blockScaler = (scale: number) =>
  (block: Block) => {
    const scaleLines = lineScaler(scale)

    const scaled: Block = {
      lines: block.lines.map(scaleLines),
      width: block.width * scale,
      height: block.height * scale
    }

    return scaled
  }

export const measuredRunScaler = (scale: number) =>
  (run: MeasuredRun) => ({
    ...run,
    fontSize: run.fontSize * scale,
    width: run.width * scale,
    height: run.height * scale,
    advanceX: run.advanceX * scale
  })

export const wordScaler = (scale: number) =>
  (word: Word) => ({
    ...word,
    width: word.width * scale,
    height: word.height * scale,
    advanceX: word.advanceX * scale,
    runs: word.runs.map(measuredRunScaler(scale))
  })

export const lineScaler = (scale: number) =>
  (line: Line) => ({
    ...line,
    width: line.width * scale,
    height: line.height * scale,
    words: line.words.map(wordScaler(scale))
  })
