"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineAscent = exports.runsToLines = void 0;
const runs_js_1 = require("./runs.js");
const words_js_1 = require("./words.js");
// generates hard wrapped lines from runs
const runsToLines = (measureText) => {
    const rtw = (0, words_js_1.runsToWords)(measureText);
    const rtl = (runs) => {
        // handle hard breaks and split into words
        const runLines = (0, runs_js_1.splitRunsIntoLines)(runs);
        const lines = [];
        for (const rl of runLines) {
            const words = rtw(rl);
            const line = {
                words,
                width: 0,
                height: 0
            };
            for (const word of words) {
                line.width += word.advanceX;
                line.height = Math.max(line.height, word.height);
            }
            lines.push(line);
        }
        return lines;
    };
    return rtl;
};
exports.runsToLines = runsToLines;
// find the maximum ascent of the words in a line
const lineAscent = (measureAscent) => (line) => {
    let maxAscent = 0;
    for (const word of line.words) {
        for (const run of word.runs) {
            maxAscent = Math.max(maxAscent, measureAscent(run));
        }
    }
    return maxAscent;
};
exports.lineAscent = lineAscent;
//# sourceMappingURL=lines.js.map