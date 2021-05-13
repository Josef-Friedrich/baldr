import { Sample } from './sample';
import { ClientMediaAsset } from './asset';
export declare class Cache<T> {
    protected cache: {
        [ref: string]: T;
    };
    constructor();
    add(ref: string, mediaObject: T): boolean;
    get(ref: string): T | undefined;
    /**
     * The size of the cache. Indicates how many media objects are in the cache.
     */
    get size(): number;
    getAll(): T[];
    reset(): void;
    [Symbol.iterator](): Generator<T, any, any>;
}
/**
 * Media assets have two URI schemes: `uuid:` and `ref:`. Internally we use only
 * the `ref` scheme. This cache enables the translation from `uuid` to `ref`
 * URIs.
 */
export declare class MediaUriTranslator {
    private uuids;
    constructor();
    /**
     *
     * @param ref The authority in the reference (`ref`) scheme. The prefixed
     *   scheme can be omitted.
     * @param uuid The authority in the Universally Unique Identifier (`uuid`)
     *   scheme. The prefixed scheme can be omitted.
     *
     * @returns True, if the uri authority pair was successfully added, false
     *   if the pair was already added.
     */
    addPair(ref: string, uuid: string): boolean;
    /**
     * Get the reference authority from the Universally Unique Identifier (uuid)
     * authority. The input must be specified without the scheme prefixes and the
     * output is prefixed with the `ref:` scheme.
     *
     * @param uuid With out the scheme prefix.
     *
     * @returns The reference authority with `ref:`
     */
    private getRefFromUuid;
    /**
     * Get the fully qualified media URI using the reference `ref` scheme. A URI
     * specified with `uuid` is converted to the `ref` scheme. A fragment
     * `#fragment` can be specified.
     *
     * @param uuidOrRef Scheme prefix is required, for example `ref:Mozart` or
     * `uuid:…`
     *
     * @returns A fully qualified media URI using the reference `ref` scheme, for
     * example `ref:Alla-Turca#complete`
     */
    getRef(uuidOrRef: string, withoutFragment?: boolean): string | undefined;
    reset(): void;
}
export declare const mediaUriTranslator: MediaUriTranslator;
/**
 * @param uri A asset URI in various formats.
 *
 * @returns A asset URI (without the fragment) in the `ref` scheme.
 */
export declare function translateToAssetRef(uri: string): string | undefined;
/**
 * for example: translates `ref:test` into `ref:test#complete` or
 * `uuid:88ad5df3-d7f9-4e9e-9522-e205f51eedb3` into `ref:test#complete`
 *
 * @param uri A asset or sample URI in various formats.
 *
 * @returns A sample URI in the `ref` scheme. A missing fragment is added with `#complete`.
 */
export declare function translateToSampleRef(uri: string): string | undefined;
declare class SampleCache extends Cache<Sample> {
}
export declare const sampleCache: SampleCache;
export declare class AssetCache extends Cache<ClientMediaAsset> {
    add(ref: string, asset: ClientMediaAsset): boolean;
    get(uuidOrRef: string): ClientMediaAsset | undefined;
}
export declare const assetCache: AssetCache;
export declare function resetMediaCache(): void;
export {};
