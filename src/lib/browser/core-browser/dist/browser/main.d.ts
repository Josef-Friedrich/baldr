/**
 * Base core functionality for the code running in the browser without node.
 *
 * Run `npm run build` to build the node version of this code. The node
 * version uses the CommonJS module system instead of the ES module system.
 *
 * @module @bldr/core-browser
 */
export * from './object-manipulation';
export * from './string-format';
/**
 * Get the extension from a file path.
 *
 * @param filePath - A file path or a single file name.
 *
 * @returns The extension in lower case characters.
 */
export declare function getExtension(filePath: string): string | undefined;
/**
 * Sleep some time
 *
 * @see {@link https://github.com/erikdubbelboer/node-sleep}
 *
 * @param milliSeconds
 */
export declare function msleep(milliSeconds: number): void;
interface SelectionSubsetOption {
    /**
     * `numeric`, or a truety value.
     */
    sort?: string | boolean;
    /**
     * An array of elements to build a subset
     */
    elements?: any[];
    /**
     * If `elements` is undefined, an array with integers is created und
     * used as `elements`.
     */
    elementsCount?: number;
    firstElementNo?: number;
    /**
     * Shift all selector numbers by this number: For example `-1`: `2-5`
     *   is internally treated as `1-4`
     */
    shiftSelector?: number;
}
/**
 * Select a subset of elements by a string (`subsetSelector`). `1` is the first
 * element of the `elements` array.
 *
 * @param subsetSelector - Select a subset of elements. Examples
 *
 * - `` (emtpy string or value which evalutes to false): All elements.
 * - `1`: The first element.
 * - `1,3,5`: The first, the third and the fifth element.
 * - `1-3,5-7`: `1,2,3,5,6,7`
 * - `-7`: All elements from the beginning up to `7` (`1-7`).
 * - `7-`: All elements starting from `7` (`7-end`).
 *
 * @param options
 */
export declare function selectSubset(subsetSelector: string | undefined, { sort, elements, elementsCount, firstElementNo, shiftSelector }: SelectionSubsetOption): any[];
/**
 * Sort alphabetically an array of objects by some specific properties.
 *
 * @param property - Key of the object to sort.
 * @see {@link https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript Tutorial}
 */
export declare function sortObjectsByProperty(property: string): (a: {
    [key: string]: any;
}, b: {
    [key: string]: any;
}) => any;
/**
 * TODO: Remove use class MediaUri()
 *
 * Check if the input is a valid URI. Prefix with `ref:` if necessary.
 *
 * @param uri - The URI to validate.
 */
export declare function validateUri(uri: string): string;
/**
 * Split a HTML text into smaller chunks by looping over the children.
 *
 * @param htmlString - A HTML string.
 * @param charactersOnSlide - The maximum number of characters that may be
 *   contained in a junk.
 *
 * @returns An array of HTML chunks.
 */
export declare function splitHtmlIntoChunks(htmlString: string, charactersOnSlide: number): string[];
/**
 * TODO: Remove -> use Set()
 *
 * Remove duplicates from an array. A new array is created and returned.
 *
 * @param input - An array with possible duplicate entries.
 *
 * @returns A new array with no duplicates.
 */
export declare function removeDuplicatesFromArray(input: string[]): string[];
/**
 * Make a set of strings.
 *
 * @param values - Some strings to add to the set
 *
 * @returns A new set.
 */
export declare function makeSet(values: string | string[] | Set<string>): Set<string>;
/**
 * Generate a UUID (Universally Unique Identifier) in version 4. A version 4
 * UUID is randomly generated. This is a small wrapper around `uuid.v4()`
 *
 * @returns An UUID version 4
 */
export declare function genUuid(): string;
/**
 * @param duration - in seconds
 *
 * @return `01:23`
 */
export declare function formatDuration(duration: number | string, short?: boolean): string;
