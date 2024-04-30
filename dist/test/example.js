"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = void 0;
const index_js_1 = require("../index.js");
// assumes fonts already loaded and etc
const example = (ctx) => {
    const runToCssFontString = (run) => `${run.fontSize}px ${run.fontFamily}`;
    const measure = run => {
        ctx.font = runToCssFontString(run);
        return ctx.measureText(run.text).width;
    };
    const drawRun = (run, x, y) => {
        ctx.font = runToCssFontString(run);
        ctx.fillStyle = run.color || 'black';
        ctx.fillText(run.text, x, y);
    };
    // create some runs
    const runs = [
        {
            text: "🐈",
            fontFamily: "NotoEmoji",
            fontSize: 80,
            lineHeight: 1.2,
            color: "#b7410e"
        },
        {
            text: "Sphinx of black",
            fontFamily: "NotoBold",
            fontSize: 80,
            lineHeight: 1.2,
            color: "#0e1f41"
        },
        // etc
    ];
    const wrapHard = (0, index_js_1.hardWrapper)(measure);
    // generate a layout respecting newlines in the runs provided
    const hardWrapped = wrapHard(runs);
    // soft wrap lines at eg 800 pixels
    const wrapSoft = (0, index_js_1.softWrapper)(800);
    const softWrapped = wrapSoft(hardWrapped);
    const blockDraw = (0, index_js_1.drawBlock)(drawRun);
    // draw the layout at x: 50, y: 50
    blockDraw(softWrapped, 50, 50);
    // or fit the layout to a given size
    const fitBlock = (0, index_js_1.fitter)({ width: 800, height: 600 });
    const fitResult = fitBlock(hardWrapped);
    // draw the layout at x: 50, y: 50
    blockDraw(fitResult.wrapped, 50, 50);
};
exports.example = example;
//# sourceMappingURL=example.js.map