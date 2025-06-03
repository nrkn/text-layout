import { Block, Line, MeasuredRun, Word } from './types.js'

// scale a block by a factor
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

// scale a measured run by a factor  
export const measuredRunScaler = (scale: number) =>
  (run: MeasuredRun) => {
    run = {
      ...run,
      fontSize: run.fontSize * scale,
      width: run.width * scale,
      height: run.height * scale,
      advanceX: run.advanceX * scale
    }

    if(
      run.actualBoundingBoxAscent !== undefined &&
      run.actualBoundingBoxDescent !== undefined && 
      run.actualBoundingBoxLeft !== undefined &&
      run.actualBoundingBoxRight !== undefined
    ) {
      run.actualBoundingBoxAscent *= scale
      run.actualBoundingBoxDescent *= scale
      run.actualBoundingBoxLeft *= scale
      run.actualBoundingBoxRight *= scale
    }

    return run
  }

// scale a word by a factor  
export const wordScaler = (scale: number) =>
  (word: Word) => ({
    ...word,
    width: word.width * scale,
    height: word.height * scale,
    advanceX: word.advanceX * scale,
    runs: word.runs.map(measuredRunScaler(scale))
  })

// scale a line by a factor  
export const lineScaler = (scale: number) =>
  (line: Line) => ({
    ...line,
    width: line.width * scale,
    height: line.height * scale,
    words: line.words.map(wordScaler(scale))
  })
