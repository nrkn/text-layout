"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solidFitter = void 0;
const scale_js_1 = require("./scale.js");
// fits the text such that it creates a solid wall of text, eg every line is the
// same width
const solidFitter = (maxWidth) => (block) => {
    const solid = {
        lines: [],
        width: 0,
        height: 0,
        maxWidth
    };
    let longestLineWidth = 0;
    for (const line of block.lines) {
        longestLineWidth = Math.max(longestLineWidth, line.width);
    }
    const scaleWidth = maxWidth / longestLineWidth;
    for (const line of block.lines) {
        let scaledLine = line;
        if (line.width > 0) {
            const scaleLine = longestLineWidth / line.width;
            const scale = scaleWidth * scaleLine;
            scaledLine = (0, scale_js_1.lineScaler)(scale)(line);
        }
        solid.lines.push(scaledLine);
        solid.width = Math.max(solid.width, scaledLine.width);
        solid.height += scaledLine.height;
    }
    return solid;
};
exports.solidFitter = solidFitter;
//# sourceMappingURL=solid.js.map