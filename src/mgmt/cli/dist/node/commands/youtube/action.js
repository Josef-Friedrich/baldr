"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// Node packages.
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_utils_1 = require("@bldr/cli-utils");
const media_manager_1 = require("@bldr/media-manager");
const youtube_api_1 = require("@bldr/youtube-api");
const log = __importStar(require("@bldr/log"));
function requestYoutubeApi(youtubeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const snippet = yield youtube_api_1.getSnippet(youtubeId);
        if (snippet != null) {
            return {
                youtubeId,
                originalHeading: snippet.title,
                originalInfo: snippet.description
            };
        }
    });
}
/**
 *
 */
function action(youtubeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const meta = yield requestYoutubeApi(youtubeId);
        if (meta == null) {
            log.error('Metadata of the YouTube video “%s” could not be fetched.', youtubeId);
            return;
        }
        const metaData = meta;
        console.log(metaData);
        const parentDir = media_manager_1.locationIndicator.getPresParentDir(process.cwd());
        const ytDir = path_1.default.join(parentDir, 'YT');
        if (!fs_1.default.existsSync(ytDir)) {
            fs_1.default.mkdirSync(ytDir);
        }
        const cmd = new cli_utils_1.CommandRunner();
        cmd.startSpin();
        cmd.log('Updating youtube-dl using pip3.');
        yield cmd.exec(['pip3', 'install', '--upgrade', 'youtube-dl']);
        cmd.log('Downloading the YouTube video.');
        yield cmd.exec([
            'youtube-dl',
            '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            '--output', youtubeId,
            '--write-thumbnail',
            youtubeId
        ], { cwd: ytDir });
        const ytFile = path_1.default.resolve(ytDir, `${youtubeId}.mp4`);
        cmd.log('Creating the metadata file in the YAML format.');
        metaData.categories = 'youtube';
        yield media_manager_1.operations.initializeMetaYaml(ytFile, metaData);
        cmd.log('Normalizing the metadata file.');
        yield media_manager_1.operations.normalizeMediaAsset(ytFile);
        const srcPreviewJpg = ytFile.replace(/\.mp4$/, '.jpg');
        const srcPreviewWebp = ytFile.replace(/\.mp4$/, '.webp');
        const destPreview = ytFile.replace(/\.mp4$/, '.mp4_preview.jpg');
        if (fs_1.default.existsSync(srcPreviewJpg)) {
            fs_1.default.renameSync(srcPreviewJpg, destPreview);
        }
        else if (fs_1.default.existsSync(srcPreviewWebp)) {
            yield cmd.exec(['magick',
                'convert', srcPreviewWebp, destPreview], { cwd: ytDir });
            fs_1.default.unlinkSync(srcPreviewWebp);
        }
        cmd.stopSpin();
    });
}
module.exports = action;
