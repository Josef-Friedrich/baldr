import type { AssetType } from '@bldr/type-definitions';
import { MediaUri } from '@bldr/client-media-models';
import { SampleCollection, MimeTypeShortcutCounter } from './internal';
export declare const imageShortcutCounter: MimeTypeShortcutCounter;
/**
 * Hold various data of a media file as class properties.
 *
 * If a media file has a property with the name `multiPartCount` set, it is a
 * multi part asset. A multi part asset can be restricted to one part only by a
 * URI fragment (for example `#2`). The URI `ref:Score#2` resolves always to the
 * HTTP URL `http:/example/media/Score_no02.png`.
 */
export declare class ClientMediaAsset {
    /**
     * To be able to distinguish the old and the new version of the class.
     *
     * TODO remove
     */
    ng: boolean;
    /**
     * A raw javascript object read from the YAML files
     * (`*.extension.yml`)
     */
    yaml: AssetType.RestApiRaw;
    uri: MediaUri;
    /**
     * The keyboard shortcut to launch the media asset. At the moment only used by
     * images.
     */
    private shortcut_?;
    /**
     * The HTMLMediaElement of the media file.
     */
    htmlElement?: object;
    /**
     * The media type, for example `image`, `audio` or `video`.
     */
    mimeType: string;
    /**
     * HTTP Uniform Resource Locator, for example
     * `http://localhost/media/Lieder/i/Ich-hab-zu-Haus-ein-Gramophon/HB/Ich-hab-zu-Haus-ein-Grammophon.m4a`.
     */
    httpUrl: string;
    samples?: SampleCollection;
    /**
     * @param yaml - A raw javascript object read from the Rest API
     */
    constructor(uri: string, httpUrl: string, yaml: AssetType.RestApiRaw);
    /**
     * The reference authority of the URI using the `ref` scheme. The returned
     * string is prefixed with `ref:`.
     */
    get ref(): string;
    /**
     * The UUID authority of the URI using the `uuid` scheme. The returned
     * string is prefixed with `uuid:`.
     */
    get uuid(): string;
    set shortcut(value: string | undefined);
    get shortcut(): string | undefined;
    /**
     * Each media asset can have a preview image. The suffix `_preview.jpg`
     * is appended on the path. For example
     * `http://localhost/media/Lieder/i/Ich-hab-zu-Haus-ein-Gramophon/HB/Ich-hab-zu-Haus-ein-Grammophon.m4a_preview.jpg`
     */
    get previewHttpUrl(): string | undefined;
    get titleSafe(): string;
    /**
     * True if the media file is playable, for example an audio or a video file.
     */
    get isPlayable(): boolean;
    /**
     * True if the media file is visible, for example an image or a video file.
     */
    get isVisible(): boolean;
    /**
     * The actual multi part asset count. If the multi part asset is restricted
     * the method returns 1, else the count of all the parts.
     */
    get multiPartCount(): number;
    /**
     * Retrieve the HTTP URL of the multi part asset by the part number.
     *
     * @param The part number starts with 1.
     */
    getMultiPartHttpUrlByNo(no: number): string;
}
/**
 * A multipart asset can be restricted in different ways. This class holds the
 * data of the restriction (for example all parts, only a single part, a
 * subset of parts). A multi part asset can be restricted to one part only by a
 * URI fragment (for example `#2`). The URI `ref:Score#2` resolves always to the
 * HTTP URL `http:/example/media/Score_no02.png`.
 */
export declare class MultiPartSelection {
    selectionSpec: string;
    asset: ClientMediaAsset;
    partNos: number[];
    /**
     * The URI of the media asset suffixed with the selection specification.
     * `ref:Beethoven-9th#2,3,4,6-8`. A URI without a selection specification
     * means all parts.
     */
    uri: string;
    /**
     * @param selectionSpec - Can be a URI, everthing after `#`, for
     * example `ref:Song-2#2-5` -> `2-5`
     */
    constructor(asset: ClientMediaAsset, selectionSpec: string);
    /**
     * The URI using the `ref` authority.
     */
    get ref(): string;
    get partCount(): number;
    /**
     * Used for the preview to fake that this class is a normal asset.
     */
    get httpUrl(): string;
    /**
     * Retrieve the HTTP URL of the multi part asset by the part number.
     *
     * @param The part number starts with 1. We set a default value,
     * because no is sometimes undefined when only one part is selected. The
     * router then creates no step url (not /slide/1/step/1) but (/slide/1)
     */
    getMultiPartHttpUrlByNo(no?: number): string;
}
