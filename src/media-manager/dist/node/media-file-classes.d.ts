import { MediaCategoriesManager } from '@bldr/core-browser';
/**
 * Base class for the asset and presentation class.
 */
declare class MediaFile {
    /**
     * The absolute path of the file.
     */
    protected absPath: string;
    /**
     * @param filePath - The file path of the media file.
     */
    constructor(filePath: string);
    /**
     * The file extension of the media file.
     */
    get extension(): string | undefined;
    /**
     * The basename (filename without extension) of the file.
     */
    get basename(): string;
}
/**
 * A media asset.
 */
export declare class Asset extends MediaFile {
    private metaData;
    /**
     * @param filePath - The file path of the media asset.
     */
    constructor(filePath: string);
    get id(): string | undefined;
    get mediaCategory(): string | undefined;
}
/**
 * Make a media asset from a file path.
 *
 * @param filePath - The file path of the media asset.
 */
export declare function makeAsset(filePath: string): Asset;
export declare const mediaCategoriesManager: MediaCategoriesManager;
/**
 * @param filePath - The file path of the media asset.
 */
export declare function filePathToAssetType(filePath: string): string | undefined;
export {};
