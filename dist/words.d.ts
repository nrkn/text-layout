import { Block, Line, MeasureRunWidth, TextRun, Word } from './types.js';
export declare const runsToWords: (measureText: MeasureRunWidth) => (runs: TextRun[]) => Word[];
export declare const emptyWord: () => Word;
export declare const longestWordInLine: (line: Line) => Word;
export declare const longestWordInBlock: (block: Block) => Word;
