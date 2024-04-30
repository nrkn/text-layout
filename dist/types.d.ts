export type TextRunStyle = {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color?: string;
};
export type TextRun = {
    text: string;
} & TextRunStyle;
export type Width = {
    width: number;
};
export type Height = {
    height: number;
};
export type Size = Width & Height;
export type AdvanceX = {
    advanceX: number;
};
export type MaxWidth = {
    maxWidth: number;
};
export type MeasureRunWidth = (run: TextRun) => number;
export type MeasureRunAscent = (run: TextRun) => number;
export type RunBounds = {
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    actualBoundingBoxLeft: number;
    actualBoundingBoxRight: number;
};
export type MeasureRunBounds = (run: TextRun) => RunBounds;
export type MeasuredRun = TextRun & Size & AdvanceX;
export type Align = 'left' | 'center' | 'right';
export type Word = {
    runs: MeasuredRun[];
} & Size & AdvanceX;
export type Line = {
    words: Word[];
} & Size;
export type Block = {
    lines: Line[];
} & Size;
export type AdjustedBlock = Block & {
    left: number;
    top: number;
};
export type WrappedBlock = Block & MaxWidth;
export type SoftWrapper = (maxWidth: number) => (block: Block) => WrappedBlock;
export type HardWrapper = (measure: MeasureRunWidth) => (runs: TextRun[]) => Block;
export type DrawRun = (run: MeasuredRun, x: number, y: number, word: Word, line: Line, block: WrappedBlock) => void;
export type FailedFit = 'under' | 'over';
export type FitType = 'shrink' | 'fit';
export type FitterOptions = {
    tolerance: number;
    scaleStep: number;
    maxIterations: number;
    fitType: FitType;
    wrapper: SoftWrapper;
};
export type FitStrategy = 'widest word' | 'height' | 'shrink';
export type FitFoundDuring = ('initial' | 'estimate' | 'lower bound search' | 'upper bound search' | 'mid scale' | 'binary search');
export type FitResult = {
    wrapped: WrappedBlock;
    bounds: Size;
    strategy: FitStrategy;
    scale: number;
    iterations: number;
    foundDuring: FitFoundDuring;
};
