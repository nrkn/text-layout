import {
  MeasureMetrics,
  MeasureRunBounds,
  MeasureRunWidth, MeasuredRun, RunBounds, TextRun, TextRunStyle
} from './types.js'

export const defaultRun = (text: string): TextRun => ({
  text,
  fontFamily: 'sans-serif',
  fontSize: 16,
  lineHeight: 1.2
})

export const createRun = (
  text: string, ...styles: Partial<TextRunStyle>[]
): TextRun =>
  Object.assign(defaultRun(text), ...styles)

export const runFactory = (...baseStyles: Partial<TextRunStyle>[]) =>
  (text: string, ...instanceStyles: Partial<TextRunStyle>[]) =>
    createRun(text, ...baseStyles, ...instanceStyles)

export const runScaler = (fontSizeScale: number) =>
  (run: TextRun): TextRun =>
    Object.assign({}, run, { fontSize: run.fontSize * fontSizeScale })

// split, but retain the space at the end - except for the last run
export const splitRunOnSpaces = (run: TextRun): TextRun[] => {
  const words = run.text.replace(/\t/g, ' ').split(' ')

  if (words.length === 1) return [run]

  return words.map((word, i) => ({
    ...run,
    text: word + (i === words.length - 1 ? '' : ' ')
  }))
}

export const splitRunsOnSpaces = (runs: TextRun[]): TextRun[] =>
  runs.flatMap(splitRunOnSpaces)

export const splitRunOnNewlines = (run: TextRun): TextRun[] => {
  const lines = run.text.replace(/\r\n/g, '\n').split('\n')

  if (lines.length === 1) return [run]

  return lines.map(line => ({
    ...run,
    text: line
  }))
}

export const splitRunsIntoLines = (runs: TextRun[]): TextRun[][] => {
  const lines: TextRun[][] = []
  let currentLine: TextRun[] = []

  for (const run of runs) {
    const splitRuns = splitRunOnNewlines(run)

    if (splitRuns.length === 0) {
      continue // Skip empty runs if any
    }

    // Add the first part to the current line
    currentLine.push(splitRuns[0])

    // If more than one line, add current line to lines and start new ones
    for (let i = 1; i < splitRuns.length; i++) {
      lines.push(currentLine) // Store completed line
      currentLine = [splitRuns[i]] // Start a new line with the current part
    }
  }

  // After the loop, add the last line if not empty
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

export const groupWords = (wordRuns: TextRun[]): TextRun[][] => {
  const groups: TextRun[][] = []
  let currentGroup: TextRun[] = []

  for (let i = 0; i < wordRuns.length; i++) {
    const run = wordRuns[i]

    currentGroup.push(run)

    // Check if the current run has a trailing space or if it's the last run
    if (run.text.endsWith(' ') || i === wordRuns.length - 1) {
      groups.push(currentGroup)
      currentGroup = []
    }
  }

  return groups
}

const trimEnd = (run: TextRun) => ({
  ...run,
  text: run.text.trimEnd()
})

export const measuredRun = (
  measureWidth: MeasureRunWidth | MeasureMetrics
) =>
  (run: TextRun): MeasuredRun => {
    let width = 0
    let bounds: Partial<RunBounds> = {}
    const height = run.fontSize * run.lineHeight

    const nextX = measureWidth(run)
    let advanceX: number

    if (typeof nextX === 'number') {
      width = (
        run.text.endsWith(' ') ?
          (measureWidth as MeasureRunWidth)(trimEnd(run)) :
          nextX
      )
      advanceX = nextX
    } else {
      width = (
        run.text.endsWith(' ') ?
          (measureWidth as MeasureMetrics)(trimEnd(run)).width :
          nextX.width
      )

      advanceX = nextX.width

      const {
        actualBoundingBoxAscent, actualBoundingBoxDescent,
        actualBoundingBoxLeft, actualBoundingBoxRight
      } = nextX

      Object.assign(bounds, {
        actualBoundingBoxAscent, actualBoundingBoxDescent,
        actualBoundingBoxLeft, actualBoundingBoxRight
      })
    }

    return { ...run, width, height, advanceX, ...bounds }
  }
