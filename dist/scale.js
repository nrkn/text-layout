"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineScaler = exports.wordScaler = exports.measuredRunScaler = exports.blockScaler = void 0;
// scale a block by a factor
const blockScaler = (scale) => (block) => {
    const scaleLines = (0, exports.lineScaler)(scale);
    const scaled = {
        lines: block.lines.map(scaleLines),
        width: block.width * scale,
        height: block.height * scale
    };
    return scaled;
};
exports.blockScaler = blockScaler;
// scale a measured run by a factor  
const measuredRunScaler = (scale) => (run) => ({
    ...run,
    fontSize: run.fontSize * scale,
    width: run.width * scale,
    height: run.height * scale,
    advanceX: run.advanceX * scale
});
exports.measuredRunScaler = measuredRunScaler;
// scale a word by a factor  
const wordScaler = (scale) => (word) => ({
    ...word,
    width: word.width * scale,
    height: word.height * scale,
    advanceX: word.advanceX * scale,
    runs: word.runs.map((0, exports.measuredRunScaler)(scale))
});
exports.wordScaler = wordScaler;
// scale a line by a factor  
const lineScaler = (scale) => (line) => ({
    ...line,
    width: line.width * scale,
    height: line.height * scale,
    words: line.words.map((0, exports.wordScaler)(scale))
});
exports.lineScaler = lineScaler;
//# sourceMappingURL=scale.js.map