import { getExtension } from '@bldr/core-browser';
import { mimeTypeManager } from './mime-type';
import { MediaUri, MediaUriCache } from './media-uri';
import { Sample } from './sample';
/**
 * Hold various data of a media file as class properties.
 *
 * If a media file has a property with the name `multiPartCount` set, it is a
 * multi part asset. A multi part asset can be restricted to one part only by a
 * URI fragment (for example `#2`). The URI `id:Score#2` resolves always to the
 * HTTP URL `http:/example/media/Score_no02.png`.
 */
export class ClientMediaAsset {
    /**
     * @param meta - A raw javascript object read from the Rest API
     */
    constructor(uri, httpUrl, meta) {
        this.uri = new MediaUri(uri);
        this.httpUrl = httpUrl;
        this.meta = meta;
        if (this.meta.extension == null && this.meta.filename != null) {
            const extension = getExtension(this.meta.filename);
            if (extension != null) {
                this.meta.extension = extension;
            }
        }
        if (this.meta.extension == null) {
            throw Error('The client media assets needs a extension');
        }
        this.mimeType = mimeTypeManager.extensionToType(this.meta.extension);
        this.samples = this.createSamples();
    }
    /**
     * The URI using the `id` scheme.
     */
    get id() {
        return this.meta.id;
    }
    /**
     * The URI using the `uuid` scheme.
     */
    get uuid() {
        return this.meta.uuid;
    }
    /**
     * Create samples for each playable media file. By default each media file
     * has one sample called “complete”.
     */
    createSamples() {
        if (this.isPlayable) {
            // First sample of each playable media file is the “complete” track.
            // const completeSampleSpec = {
            //   title: 'komplett',
            //   id: 'complete',
            //   startTime: 0
            // }
            // for (const prop of ['startTime', 'duration', 'endTime', 'fadeOut', 'fadeIn', 'shortcut']) {
            //   if (asset[prop]) {
            //     completeSampleSpec[prop] = asset[prop]
            //     delete asset[prop]
            //   }
            // }
            // Store all sample specs in a object to check if there is already a
            // sample with the id “complete”.
            // let sampleSpecs = null
            // if (asset.samples) {
            //   sampleSpecs = {}
            //   for (const sampleSpec of asset.samples) {
            //     sampleSpecs[sampleSpec.id] = sampleSpec
            //   }
            // }
            // Create the sample “complete”.
            // let sample
            // const samples = {}
            // if (!sampleSpecs || (sampleSpecs && !('complete' in sampleSpecs))) {
            //   sample = new Sample(this, completeSampleSpec)
            //   samples[sample.uri] = sample
            // }
            const samples = [];
            // Add further samples specifed in the yaml section.
            if (this.meta.samples != null) {
                for (const sampleSpec of this.meta.samples) {
                    samples.push(new Sample(this, sampleSpec));
                }
            }
            // for (const sampleUri in samples) {
            //   samples[sampleUri].mediaElement = createMediaElement(asset)
            // }
            return samples;
        }
    }
    /**
     * Store the file name from a HTTP URL.
     *
     * @param {String} url
     */
    // filenameFromHTTPUrl (url) {
    //   this.filename = url.split('/').pop()
    // }
    /**
     * Merge an object into the class object.
     *
     * @param {object} properties - Add an object to the class properties.
     */
    // addProperties (properties) {
    //   for (const property in properties) {
    //     this[property] = properties[property]
    //   }
    // }
    get titleSafe() {
        if (this.meta.title != null)
            return this.meta.title;
        if (this.meta.filename != null)
            return this.meta.filename;
        return this.uri.raw;
    }
    /**
     * True if the media file is playable, for example an audio or a video file.
     */
    get isPlayable() {
        return ['audio', 'video'].includes(this.mimeType);
    }
    /**
     * True if the media file is visible, for example an image or a video file.
     */
    get isVisible() {
        return ['image', 'video'].includes(this.mimeType);
    }
}
export class AssetCache {
    constructor() {
        this.cache = {};
        this.mediaUriCache = new MediaUriCache();
    }
    add(asset) {
        if (this.mediaUriCache.addPair(asset.id, asset.uuid)) {
            this.cache[asset.id] = asset;
            return true;
        }
        return false;
    }
    get(uuidOrId) {
        const id = this.mediaUriCache.getId(uuidOrId);
        if (id != null && this.cache[id] != null) {
            return this.cache[id];
        }
    }
    getAll() {
        return Object.values(this.cache);
    }
}
