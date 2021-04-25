import { ClientMediaAsset } from '@bldr/client-media-models';
export declare const httpRequest: import("@bldr/http-request").HttpRequest;
/**
 * Resolve (get the HTTP URL and some meta informations) of a remote media
 * file by its URI. Resolve a local file. The local files have to dropped
 * in the application. Create media elements for each media file. Create samples
 * for playable media files.
 */
export declare class Resolver {
    /**
     * Assets with linked assets have to be cached. For example: many
     * audio assets can have the same cover ID.
     */
    private cache;
    constructor();
    /**
     * @param field - For example `id` or `uuid`
     * @param search - For example `Fuer-Elise_HB`
     * @param throwException - Throw an exception if the media URI
     *  cannot be resolved (default: `true`).
     *
     * @returns {Object} - See {@link https://github.com/axios/axios#response-schema}
     */
    private queryMediaServer;
    /**
     * Create samples for each playable media file. By default each media file
     * has one sample called “complete”.
     *
     * @param {module:@bldr/media-client.ClientMediaAsset} asset - The
     *   `asset` object, a client side representation of a media asset.
     *
     * @returns {module:@bldr/media-client~Sample[]}
     */
    /**
     * @private
     *
     * @param {String} uri - For example `uuid:... id:...`
     * @param {Object} data - Object from the REST API.
     *
     * @returns {module:@bldr/media-client.ClientMediaAsset}
     */
    /**
     * @private
     *
     * @param {Object} file - A file object, see
     *  {@link https://developer.mozilla.org/de/docs/Web/API/File}
     *
     * @returns {module:@bldr/media-client.ClientMediaAsset}
     */
    /**
     * @param {module:@bldr/media-client.ClientMediaAsset} asset
     */
    /**
     * Resolve (get the HTTP URL and some meta informations) of a remote media
     * file by its URI.
     */
    private resolveSingle;
    /**
     * Resolve one or more remote media files by URIs.
     *
     * Linked media URIs are resolved recursively.
     *
     * @param uris - A single media URI or an array of media URIs.
     */
    resolve(uris: string | string[] | Set<string>): Promise<ClientMediaAsset[]>;
}
