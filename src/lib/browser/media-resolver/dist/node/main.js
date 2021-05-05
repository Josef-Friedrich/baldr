"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = exports.httpRequest = void 0;
const http_request_1 = require("@bldr/http-request");
const client_media_models_1 = require("@bldr/client-media-models");
const core_browser_1 = require("@bldr/core-browser");
const config_1 = require("@bldr/config");
exports.httpRequest = http_request_1.makeHttpRequestInstance(config_1.default, 'automatic', '/api/media');
/**
 * Resolve (get the HTTP URL and some meta informations) of a remote media
 * file by its URI. Create media elements for each media file. Create samples
 * for playable media files.
 */
class Resolver {
    constructor() {
        this.cache = {};
    }
    /**
     * Query the media server to get meta informations and the location of the file.
     *
     * @param field - For example `id` or `uuid`
     * @param search - For example `Fuer-Elise_HB`
     * @param throwException - Throw an exception if the media URI
     *  cannot be resolved (default: `true`).
     */
    queryMediaServer(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaUri = new client_media_models_1.MediaUri(uri);
            const field = mediaUri.scheme;
            const search = mediaUri.authority;
            const cacheKey = mediaUri.uriWithoutFragment;
            if (this.cache[cacheKey] != null) {
                return this.cache[cacheKey];
            }
            const response = yield exports.httpRequest.request({
                url: 'query',
                method: 'get',
                params: {
                    type: 'assets',
                    method: 'exactMatch',
                    field: field,
                    search: search
                }
            });
            if (response == null || response.status !== 200 || response.data == null) {
                throw new Error(`Media with the ${field} ”${search}” couldn’t be resolved.`);
            }
            const rawRestApiAsset = response.data;
            this.cache[cacheKey] = rawRestApiAsset;
            return rawRestApiAsset;
        });
    }
    /**
     * Resolve (get the HTTP URL and some meta informations) of a remote media
     * file by its URI.
     *
     * @param uri A media URI (Uniform Resource Identifier) with an optional
     *   fragment suffix, for example `ref:Yesterday#complete`. The fragment
     *   suffix is removed.
     */
    resolveSingle(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedAsset = client_media_models_1.assetCache.get(uri);
            if (cachedAsset != null)
                return cachedAsset;
            const raw = yield this.queryMediaServer(uri);
            const httpUrl = `${exports.httpRequest.baseUrl}/${config_1.default.mediaServer.urlFillIn}/${raw.path}`;
            return new client_media_models_1.ClientMediaAsset(uri, httpUrl, raw);
        });
    }
    /**
     * Resolve one or more remote media files by URIs.
     *
     * Linked media URIs are resolved recursively.
     *
     * @param uris - A single media URI or an array of media URIs.
     */
    resolve(uris) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaUris = core_browser_1.makeSet(uris);
            const urisWithoutFragements = new Set();
            for (const uri of mediaUris) {
                urisWithoutFragements.add(client_media_models_1.MediaUri.removeFragment(uri));
            }
            const assets = [];
            // Resolve the main media URIs
            while (urisWithoutFragements.size > 0) {
                const promises = [];
                for (const uri of urisWithoutFragements) {
                    promises.push(this.resolveSingle(uri));
                }
                for (const asset of yield Promise.all(promises)) {
                    client_media_models_1.findMediaUris(asset.yaml, urisWithoutFragements);
                    assets.push(asset);
                    mediaUris.delete(asset.uri.uriWithoutFragment);
                }
            }
            return assets;
        });
    }
}
exports.Resolver = Resolver;
