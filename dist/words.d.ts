import { Block, Line, MeasureMetrics, MeasureRunWidth, TextRun, Word } from './types.js';
export declare const runsToWords: (measureText: MeasureRunWidth | MeasureMetrics) => (runs: TextRun[]) => Word[];
export declare const emptyWord: () => Word;
export declare const longestWordInLine: (line: Line) => Word;
export declare const longestWordInBlock: (block: Block) => Word;
