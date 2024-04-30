import { Block, FailedFit, FitterOptions, Size, WrappedBlock } from './types.js';
export declare const fitter: (bounds: Size, options?: Partial<FitterOptions>) => (block: Block) => {
    wrapped: WrappedBlock;
    bounds: {
        width: number;
        height: number;
    };
    strategy: string;
    scale: number;
    iterations: number;
    foundDuring: string;
};
export declare const fitnessOver: FailedFit;
export declare const fitnessUnder: FailedFit;
export declare const defaultFitterOptions: () => FitterOptions;
