"use strict";
/**
 * Some basic Typescript interfaces and type defintions.
 *
 * @module @bldr/type-definitions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationTypes = exports.MasterTypes = exports.TitlesTypes = exports.MediaCategory = exports.AssetType = void 0;
exports.AssetType = require("./asset");
__exportStar(require("./cli"), exports);
__exportStar(require("./config"), exports);
exports.MediaCategory = require("./media-category");
exports.TitlesTypes = require("./titles");
exports.MasterTypes = require("./master");
exports.PresentationTypes = require("./presentation");
