"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.longestWordInBlock = exports.longestWordInLine = exports.emptyWord = exports.runsToWords = void 0;
const runs_js_1 = require("./runs.js");
// split the runs on spaces and generate words (unbreakable runs)
const runsToWords = (measureText) => {
    const mr = (0, runs_js_1.measuredRun)(measureText);
    const rtw = (runs) => {
        const withSpaces = (0, runs_js_1.splitRunsOnSpaces)(runs);
        const wordGroups = (0, runs_js_1.groupWords)(withSpaces);
        const words = [];
        for (const wg of wordGroups) {
            const measuredRuns = wg.map(mr);
            const word = {
                runs: measuredRuns,
                width: 0,
                advanceX: 0,
                height: 0
            };
            for (let i = 0; i < measuredRuns.length; i++) {
                const run = measuredRuns[i];
                word.width += run.width;
                word.advanceX += run.advanceX;
                word.height = Math.max(word.height, run.height);
                if (i === 0 && run.actualBoundingBoxLeft !== undefined) {
                    word.opticalLeft = run.actualBoundingBoxLeft;
                }
                if (i === measuredRuns.length - 1 &&
                    run.actualBoundingBoxRight !== undefined) {
                    word.opticalRight = run.actualBoundingBoxRight;
                }
            }
            words.push(word);
        }
        return words;
    };
    return rtw;
};
exports.runsToWords = runsToWords;
const emptyWord = () => ({
    runs: [],
    width: 0,
    advanceX: 0,
    height: 0
});
exports.emptyWord = emptyWord;
// find the longest word in a line
const longestWordInLine = (line) => line.words.reduce((longest, word) => word.width > longest.width ? word : longest, line.words[0] || (0, exports.emptyWord)());
exports.longestWordInLine = longestWordInLine;
// find the longest word in a block  
const longestWordInBlock = (block) => block.lines.reduce((longest, line) => {
    const lw = (0, exports.longestWordInLine)(line);
    return lw.width > longest.width ? lw : longest;
}, block.lines[0].words[0] || (0, exports.emptyWord)());
exports.longestWordInBlock = longestWordInBlock;
//# sourceMappingURL=words.js.map