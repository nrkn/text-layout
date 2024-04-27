import { Block, Line, MeasuredRun, Word } from './types.js'

export const scaleBlock = (scale: number) =>
  (block: Block) => {
    const lineScaler = scaleMeasuredLine(scale)

    const scaled: Block = {
      lines: block.lines.map(lineScaler),
      width: block.width * scale,
      height: block.height * scale
    }

    return scaled
  }

export const scaleMeasuredRun = (scale: number) => (run: MeasuredRun) => ({
  ...run,
  fontSize: run.fontSize * scale,
  width: run.width * scale,
  height: run.height * scale,
  advanceX: run.advanceX * scale
})

export const scaleMeasuredWord = (scale: number) => (word: Word) => ({
  ...word,
  width: word.width * scale,
  height: word.height * scale,
  advanceX: word.advanceX * scale,
  runs: word.runs.map(scaleMeasuredRun(scale))
})

export const scaleMeasuredLine = (scale: number) => (line: Line) => ({
  ...line,
  width: line.width * scale,
  height: line.height * scale,
  words: line.words.map(scaleMeasuredWord(scale))
})
