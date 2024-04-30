"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("@napi-rs/canvas");
const index_js_1 = require("../index.js");
const promises_1 = require("fs/promises");
canvas_1.GlobalFonts.registerFromPath('./data/fonts/NotoSans-Bold.ttf', 'Noto');
const start = async () => {
    const canvas = (0, canvas_1.createCanvas)(800, 600);
    const ctx = canvas.getContext('2d');
    // byo functions
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
            text: "Sphinx of black quartz, judge my vow.\n\nThe quick brown fox jumps over the lazy dog.",
            fontFamily: "Noto",
            fontSize: 80,
            lineHeight: 1.2,
            color: "#b7410e"
        }
    ];
    const wrapHard = (0, index_js_1.hardWrapper)(measure);
    // generate a layout respecting any newlines in the runs provided
    const hardWrapped = wrapHard(runs);
    // wrap at eg 800 pixels
    // const wrapSoft = softWrapper(800)
    //const softWrapped = wrapSoft(hardWrapped)
    const blockDraw = (0, index_js_1.drawBlock)(drawRun);
    // draw the layout at x: 50, y: 50
    // blockDraw(softWrapped, 50, 50)
    // or fit the layout to a given size
    const fitBlock = (0, index_js_1.fitter)({ width: 800, height: 600 });
    const fitResult = fitBlock(hardWrapped);
    // draw the layout at x: 50, y: 50
    const measureAscent = run => {
        ctx.font = runToCssFontString(run);
        return ctx.measureText(run.text).actualBoundingBoxAscent;
    };
    const getAscent = (0, index_js_1.lineAscent)(measureAscent);
    const x = 0;
    const y = getAscent(fitResult.wrapped.lines[0]);
    blockDraw(fitResult.wrapped, x, y);
    const png = canvas.toBuffer('image/png');
    await (0, promises_1.writeFile)('./data/test/no-fit.png', png);
};
start().catch(console.error);
//# sourceMappingURL=no-fit.js.map