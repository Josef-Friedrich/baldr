"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMediaAsset = void 0;
const core_browser_1 = require("@bldr/core-browser");
const mime_type_1 = require("./mime-type");
const media_uri_1 = require("./media-uri");
/**
 * Hold various data of a media file as class properties.
 *
 * If a media file has a property with the name `multiPartCount` set, it is a
 * multi part asset. A multi part asset can be restricted to one part only by a
 * URI fragment (for example `#2`). The URI `id:Score#2` resolves always to the
 * HTTP URL `http:/example/media/Score_no02.png`.
 *
 * @property {string} path - The relative path on the HTTP server, for example
 *   `composer/Haydn_Joseph.jpg`.
 * @property {string} filename - The file name, for example `Haydn_Joseph.jpg`.
 * @property {string} extension - The file extension, for example `jpg`.
 * @property {string} id - An identifier, for example `Haydn_Joseph`.
 * @property {string} previewHttpUrl - Each media file can have a preview image.
 *   On the path is `_preview.jpg` appended.
 * @property {string} shortcut - The keyboard shortcut to play the media.
 * @property {Object} samples - An object of Sample instances.
 * @property {Number} multiPartCount - The of count of parts if the media file
 *   is a multi part asset.
 * @property {String} cover - An media URI of a image to use a preview image
 *   for mainly audio files. Video files are also supported.
 */
class ClientMediaAsset {
    /**
     * @param raw - A raw javascript object read from the YAML files
     * (`*.extension.yml`)
     */
    constructor(raw) {
        this.raw = raw;
        if (raw.uri == null) {
            throw new Error('Every client media asset needs a uri property.');
        }
        this.uri = new media_uri_1.MediaUri(this.raw.uri);
        if (this.raw.extension == null && this.raw.filename != null) {
            const extension = core_browser_1.getExtension(this.raw.filename);
            if (extension != null) {
                this.raw.extension = extension;
            }
        }
        if (this.raw.extension == null) {
            throw Error('The client media assets needs a extension');
        }
        this.mimeType = mime_type_1.mimeTypeManager.extensionToType(this.raw.extension);
    }
}
exports.ClientMediaAsset = ClientMediaAsset;
