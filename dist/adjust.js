"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustBlock = void 0;
const adjustBlock = (measure) => (block) => {
    if (block.lines.length === 0)
        return {
            ...block,
            left: 0,
            top: 0
        };
    const firstLine = block.lines[0];
    //const lastLine = block.lines[block.lines.length - 1]
    const top = maxAscent(measure)(firstLine) * -1;
    //const bottom = maxDescent(measure)(lastLine)
    console.log('adjustBlock', { top });
    const adjusted = {
        ...block,
        left: 0, // for now
        top,
        width: block.width, // for now
        height: block.height + top,
    };
    return adjusted;
};
exports.adjustBlock = adjustBlock;
const maxAscent = (measure) => (line) => {
    let maxAscent = 0;
    for (const word of line.words) {
        for (const run of word.runs) {
            maxAscent = Math.max(maxAscent, measure(run).actualBoundingBoxAscent);
        }
    }
    return maxAscent;
};
const maxDescent = (measure) => (line) => {
    let maxDescent = 0;
    for (const word of line.words) {
        for (const run of word.runs) {
            maxDescent = Math.max(maxDescent, measure(run).actualBoundingBoxDescent);
        }
    }
    return maxDescent;
};
//# sourceMappingURL=adjust.js.map