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

export type Size = Width & Height

// a Word will have an advanceX which is width + the width of a space
export type AdvanceX = {
  advanceX: number
}

export type MaxWidth = {
  maxWidth: number
}

export type MeasureRunWidth = (run: TextRun) => number

export type MeasureRunAscent = (run: TextRun) => number

export type MeasuredRun = TextRun & Size & AdvanceX

export type Align = 'left' | 'center' | 'right'

// a word is a group of runs that should stay together, allowing styling of 
// individual parts of a word, eg initial letter bold, or a word mixing fonts
// etc
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

export type WrappedBlock = Block & MaxWidth

export type SoftWrapper = (maxWidth: number) =>
  (block: Block) => WrappedBlock

export type HardWrapper = (measure: MeasureRunWidth) =>
  (runs: TextRun[]) => Block

export type DrawRun = (
  run: MeasuredRun, x: number, y: number,
  word: Word, line: Line, block: WrappedBlock
) => void
