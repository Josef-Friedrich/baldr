/**
 * Manipulate javascript objects.
 *
 * @module @bldr/core-browser/object-manipulation
 */

/**
 * Convert various data to a string. Meant for error messages. Objects
 * are converted to a string using `JSON.stringify`
 *
 * @param data - Various data in various types.
 */
export function convertToString (data: any): string {
  if (data === null) {
    return 'null'
  } else if (data != null) {
    return typeof data
  } else if (typeof data === 'string') {
    return data
  } else if (Array.isArray(data)) {
    return data.toString()
  } else {
    return JSON.stringify(data)
  }
}

/**
 * Create a deep copy of an object. This functions uses the two methods
 * `JSON.parse()` and `JSON.stringify()` to accomplish its task.
 *
 * @param data
 */
export function deepCopy (data: object): object {
  return JSON.parse(JSON.stringify(data))
}

/**
 * A container class to store a deep copy of an object. This class can be
 * used to detect unexpected properties in an object indexed by strings.
 */
export class RawDataObject {
  /**
   * The raw data object.
   */
  raw: {[key: string]: any}
  constructor (rawData: object) {
    this.raw = deepCopy(rawData)
  }

  /**
   * Cut a property from the raw object, that means delete the property and
   * return the value.
   *
   * @param property - The property of the object.
   *
   * @returns The data stored in the property
   */
  cut (property: string): any {
    if ({}.hasOwnProperty.call(this.raw, property)) {
      const out = this.raw[property]
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.raw[property]
      return out
    }
  }

  /**
   * Assert if the raw data object is empty.
   */
  isEmpty (): boolean {
    if (Object.keys(this.raw).length === 0) return true
    return false
  }

  /**
   * Throw an exception if the stored raw data is not empty yet.
   */
  throwExecptionIfNotEmpty (): void {
    if (!this.isEmpty()) {
      throw Error(`Unknown properties in raw object: ${convertToString(this.raw)}`)
    }
  }
}