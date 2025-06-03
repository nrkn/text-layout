"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measuredRun = exports.groupWords = exports.splitRunsIntoLines = exports.splitRunOnNewlines = exports.splitRunsOnSpaces = exports.splitRunOnSpaces = exports.runScaler = exports.runFactory = exports.createRun = exports.defaultRun = void 0;
const defaultRun = (text) => ({
    text,
    fontFamily: 'sans-serif',
    fontSize: 16,
    lineHeight: 1.2
});
exports.defaultRun = defaultRun;
const createRun = (text, ...styles) => Object.assign((0, exports.defaultRun)(text), ...styles);
exports.createRun = createRun;
const runFactory = (...baseStyles) => (text, ...instanceStyles) => (0, exports.createRun)(text, ...baseStyles, ...instanceStyles);
exports.runFactory = runFactory;
const runScaler = (fontSizeScale) => (run) => Object.assign({}, run, { fontSize: run.fontSize * fontSizeScale });
exports.runScaler = runScaler;
// split, but retain the space at the end - except for the last run
const splitRunOnSpaces = (run) => {
    const words = run.text.replace(/\t/g, ' ').split(' ');
    if (words.length === 1)
        return [run];
    return words.map((word, i) => ({
        ...run,
        text: word + (i === words.length - 1 ? '' : ' ')
    }));
};
exports.splitRunOnSpaces = splitRunOnSpaces;
const splitRunsOnSpaces = (runs) => runs.flatMap(exports.splitRunOnSpaces);
exports.splitRunsOnSpaces = splitRunsOnSpaces;
const splitRunOnNewlines = (run) => {
    const lines = run.text.replace(/\r\n/g, '\n').split('\n');
    if (lines.length === 1)
        return [run];
    return lines.map(line => ({
        ...run,
        text: line
    }));
};
exports.splitRunOnNewlines = splitRunOnNewlines;
const splitRunsIntoLines = (runs) => {
    const lines = [];
    let currentLine = [];
    for (const run of runs) {
        const splitRuns = (0, exports.splitRunOnNewlines)(run);
        if (splitRuns.length === 0) {
            continue; // Skip empty runs if any
        }
        // Add the first part to the current line
        currentLine.push(splitRuns[0]);
        // If more than one line, add current line to lines and start new ones
        for (let i = 1; i < splitRuns.length; i++) {
            lines.push(currentLine); // Store completed line
            currentLine = [splitRuns[i]]; // Start a new line with the current part
        }
    }
    // After the loop, add the last line if not empty
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    return lines;
};
exports.splitRunsIntoLines = splitRunsIntoLines;
const groupWords = (wordRuns) => {
    const groups = [];
    let currentGroup = [];
    for (let i = 0; i < wordRuns.length; i++) {
        const run = wordRuns[i];
        currentGroup.push(run);
        // Check if the current run has a trailing space or if it's the last run
        if (run.text.endsWith(' ') || i === wordRuns.length - 1) {
            groups.push(currentGroup);
            currentGroup = [];
        }
    }
    return groups;
};
exports.groupWords = groupWords;
const trimEnd = (run) => ({
    ...run,
    text: run.text.trimEnd()
});
const measuredRun = (measureWidth) => (run) => {
    let width = 0;
    let bounds = {};
    const height = run.fontSize * run.lineHeight;
    const nextX = measureWidth(run);
    let advanceX;
    if (typeof nextX === 'number') {
        width = (run.text.endsWith(' ') ?
            measureWidth(trimEnd(run)) :
            nextX);
        advanceX = nextX;
    }
    else {
        width = (run.text.endsWith(' ') ?
            measureWidth(trimEnd(run)).width :
            nextX.width);
        advanceX = nextX.width;
        const { actualBoundingBoxAscent, actualBoundingBoxDescent, actualBoundingBoxLeft, actualBoundingBoxRight } = nextX;
        Object.assign(bounds, {
            actualBoundingBoxAscent, actualBoundingBoxDescent,
            actualBoundingBoxLeft, actualBoundingBoxRight
        });
    }
    return { ...run, width, height, advanceX, ...bounds };
};
exports.measuredRun = measuredRun;
//# sourceMappingURL=runs.js.map