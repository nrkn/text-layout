export type TextRunStyle = {
  fontFamily: string
  fontSize: number
  lineHeight: number
  color?: string
}

export type TextRun = {
  text: string
} & TextRunStyle

export type Width = {
  width: number
}

export type Height = {
  height: number
}

export type AdvanceX = {
  advanceX: number
}

export type Size = Width & Height

export type MeasureRunWidth = (run: TextRun) => number

export type MeasureRunAscent = (run: TextRun) => number

export type MeasuredRun = TextRun & Size & AdvanceX

// a word is a group of runs that should stay together, allowing styling of 
// individual parts of a word, eg initial letter bold, or a word mixing fonts
// etc
// the final run in each word should have a trailing space - it makes 
// measuring easier, however the final run in the final word of a line should 
// not have a trailing space
export type Word = {
  runs: MeasuredRun[]
} & Size & AdvanceX

// the width is the sum of the runs, and the height is the tallest run
export type Line = {
  words: Word[]
} & Size

// the width is the widest line, and the height is the sum of the lines
export type Block = {
  lines: Line[]
} & Size

export type RunWrapper = (measure: MeasureRunWidth) =>
  (width: number) =>
    (runs: TextRun[]) => Block

export type DrawRun = ( run: TextRun, x: number, y: number ) => void
