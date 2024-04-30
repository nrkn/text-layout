import { Line, MeasureRunAscent, MeasureRunWidth, TextRun } from './types.js';
export declare const runsToLines: (measureText: MeasureRunWidth) => (runs: TextRun[]) => Line[];
export declare const lineAscent: (measureAscent: MeasureRunAscent) => (line: Line) => number;
