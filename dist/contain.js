"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containFit = void 0;
const scale_js_1 = require("./scale.js");
// scale the existing block to fit the bounds without affecting existing 
// wrapping
const containFit = (bounds) => (block) => {
    const scaleW = bounds.width / block.width;
    const scaleH = bounds.height / block.height;
    const scale = Math.min(scaleW, scaleH);
    const scaled = (0, scale_js_1.blockScaler)(scale)(block);
    const contained = {
        ...scaled,
        maxWidth: bounds.width
    };
    return contained;
};
exports.containFit = containFit;
//# sourceMappingURL=contain.js.map