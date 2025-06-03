import { Line, MeasureMetrics, MeasureRunAscent, MeasureRunWidth, TextRun } from './types.js';
export declare const runsToLines: (measureText: MeasureRunWidth | MeasureMetrics) => (runs: TextRun[]) => Line[];
export declare const lineAscent: (measureAscent: MeasureRunAscent) => (line: Line) => number;
export declare const opticalLineAscent: (line: Line) => number | null;
