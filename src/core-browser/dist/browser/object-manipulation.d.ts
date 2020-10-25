/**
 * Manipulate javascript objects.
 *
 * @module @bldr/core-browser/object-manipulation
 */
/**
 * Create a deep copy of an object. This functions uses the two methods
 * `JSON.parse()` and `JSON.stringify()` to accomplish its task.
 *
 * @param data
 */
export declare function deepCopy(data: object): object;
declare enum PropertyConvertDirection {
    SNAKE_TO_CAMEL = 0,
    CAMEL_TO_SNAKE = 1
}
/**
 * Convert all properties in an object from `snake_case` to `camelCase` or vice
 * versa in a recursive fashion.
 *
 * @param data - Some data in various formats.
 * @param direction - `snake-to-camel` or `camel-to-snake`
 *
 * @returns Possibly an new object is returned. One should always
 *   use this returned object.
 */
export declare function convertProperties(data: any, direction?: PropertyConvertDirection): object;
/**
 * Convert all properties in an object from `snake_case` to `camelCase`.
 *
 * @param data - Some data in various formats.
 *
 * @returns Possibly an new object is returned. One should always use
 *   this returned object. Do not rely on the by reference passed in
 *   object `data`.
 */
export declare function convertPropertiesSnakeToCamel(data: any): object;
/**
 * Convert all properties in an object from `camelCase` to `snake_case`.
 *
 * @param data - Some data in various formats.
 *
 * @returns Possibly an new object is returned. One should always use
 *   this returned object. Do not rely on the by reference passed in
 *   object `data`.
 */
export declare function convertPropertiesCamelToSnake(data: any): object;
/**
 * Create a deep copy of and object.
 */
export declare class RawDataObject {
    /**
     * The raw data object.
     */
    raw: {
        [key: string]: any;
    };
    constructor(rawData: object);
    /**
     * Cut a property from the raw object, that means delete the property and
     * return the value.
     *
     * @param property - The property of the object.
     *
     * @returns The data stored in the property
     */
    cut(property: string): any;
    /**
     * Assert if the raw data object is empty.
     */
    isEmpty(): boolean;
}
export {};