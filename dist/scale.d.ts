import { Block, Line, MeasuredRun, Word } from './types.js';
export declare const blockScaler: (scale: number) => (block: Block) => Block;
export declare const measuredRunScaler: (scale: number) => (run: MeasuredRun) => {
    fontSize: number;
    width: number;
    height: number;
    advanceX: number;
    text: string;
    fontFamily: string;
    lineHeight: number;
    color?: string | undefined;
};
export declare const wordScaler: (scale: number) => (word: Word) => {
    width: number;
    height: number;
    advanceX: number;
    runs: {
        fontSize: number;
        width: number;
        height: number;
        advanceX: number;
        text: string;
        fontFamily: string;
        lineHeight: number;
        color?: string | undefined;
    }[];
};
export declare const lineScaler: (scale: number) => (line: Line) => {
    width: number;
    height: number;
    words: {
        width: number;
        height: number;
        advanceX: number;
        runs: {
            fontSize: number;
            width: number;
            height: number;
            advanceX: number;
            text: string;
            fontFamily: string;
            lineHeight: number;
            color?: string | undefined;
        }[];
    }[];
};
