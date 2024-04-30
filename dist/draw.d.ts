import { Align, DrawRun, WrappedBlock } from './types.js';
export declare const drawBlock: (drawRun: DrawRun) => (block: WrappedBlock, x?: number, y?: number) => void;
export declare const drawRunAligned: (baseDrawRun: DrawRun, align: Align) => DrawRun;
