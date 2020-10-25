/**
 * Base core functionality for the code running in the browser without node.
 *
 * Run `npm run build` to build the node version of this code. The node
 * version uses the CommonJS module system instead of the ES module system.
 *
 * @module @bldr/core-browser-ts
 */

export * from './asset-types'

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
 * Get the extension from a file path.
 *
 * @param filePath - A file path or a single file name.
 *
 * @returns The extension in lower case characters.
 */
export function getExtension (filePath: string): string | undefined {
  if (filePath) {
    const extension = String(filePath).split('.').pop()
    if (extension) {
      return extension.toLowerCase()
    }
  }
}

/**
 * Convert `camelCase` into `snake_case` strings.
 *
 * @param text - A camel cased string.
 *
 * @returns A string formatted in `snake_case`.
 *
 * @see {@link module:@bldr/core-browser.convertPropertiesCase}
 * @see {@link https://vladimir-ivanov.net/camelcase-to-snake_case-and-vice-versa-with-javascript/}
 */
export function camelToSnake (text: string): string {
  return text.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + '_' + m[1]
  }).toLowerCase()
}

/**
 * Convert `snake_case` or `kebab-case` strings into `camelCase` strings.
 *
 * @param text - A snake or kebab cased string
 *
 * @returns A string formatted in `camelCase`.
 *
 * @see {@link module:@bldr/core-browser.convertPropertiesCase}
 * @see {@link https://catalin.me/javascript-snake-to-camel/}
 */
export function snakeToCamel (text: string): string {
  return text.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  )
}

interface StringObject {
  [key: string]: any;
}

enum PropertyConvertDirection {
  SNAKE_TO_CAMEL,
  CAMEL_TO_SNAKE
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
export function convertProperties (data: any, direction: PropertyConvertDirection = PropertyConvertDirection.SNAKE_TO_CAMEL): object {
  // To perserve the order of the props.
  let newObject: StringObject | null = null

  // Array
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (typeof item === 'object') {
        data[i] = convertProperties(item, direction)
      }
    }
  // Object
  } else if (typeof data === 'object') {
    newObject = {}
    for (const oldProp in data) {
      let newProp: string
      if (direction === PropertyConvertDirection.CAMEL_TO_SNAKE) {
        newProp = camelToSnake(oldProp)
      } else {
        newProp = snakeToCamel(oldProp)
      }
      newObject[newProp] = data[oldProp]
      // Object or array
      if (typeof newObject[newProp] === 'object') {
        newObject[newProp] = convertProperties(newObject[newProp], direction)
      }
    }
  }
  if (newObject) return newObject
  return data
}

/**
 * Convert all properties in an object from `snake_case` to `camelCase`.
 *
 * @param data - Some data in various formats.
 *
 * @returns Possibly an new object is returned. One should always use
 *   this returned object. Do not rely on the by reference passed in
 *   object `data`.
 */
export function convertPropertiesSnakeToCamel (data: any): object {
  return convertProperties(data, PropertyConvertDirection.SNAKE_TO_CAMEL)
}

/**
 * Convert all properties in an object from `camelCase` to `snake_case`.
 *
 * @param data - Some data in various formats.
 *
 * @returns Possibly an new object is returned. One should always use
 *   this returned object. Do not rely on the by reference passed in
 *   object `data`.
 */
export function convertPropertiesCamelToSnake (data: any): object {
  return convertProperties(data, PropertyConvertDirection.CAMEL_TO_SNAKE)
}

/**
 * @link {@see https://www.npmjs.com/package/js-yaml}
 */
export const jsYamlConfig = {
  noArrayIndent: true,
  lineWidth: 72,
  noCompatMode: true
}

/**
 * Regular expression to detect media URIs.
 *
 * Possible URIs are: `id:Rhythm-n-Blues-Rock-n-Roll_BD_Bill-Haley#complete`
 * `uuid:c262fe9b-c705-43fd-a5d4-4bb38178d9e7`
 */
export const mediaUriRegExp = new RegExp('((id|uuid):(([a-zA-Z0-9-_]+)(#([a-zA-Z0-9-_]+))?))')

/**
 * Sleep some time
 *
 * @see {@link https://github.com/erikdubbelboer/node-sleep}
 *
 * @param milliSeconds
 */
export function msleep(milliSeconds: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliSeconds)
}

/**
 * Create a deep copy of and object.
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
}

/**
 * Escape some characters with HTML entities.
 *
 * @see {@link https://coderwall.com/p/ostduq/escape-html-with-javascript}
 */
export function escapeHtml (htmlString: string): string {
  // List of HTML entities for escaping.
  const htmlEscapes: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  // Regex containing the keys listed immediately above.
  const htmlEscaper = /[&<>"'/]/g

  // Escape a string for HTML interpolation.
  return ('' + htmlString).replace(htmlEscaper, function (match) {
    return htmlEscapes[match]
  })
}

/**
 * Generate from the file name or the url of the first element of a
 * multipart asset the nth file name or the url. The parameter
 * `firstFileName` must have a extension (for example `.jpg`). The
 * parameter `no` must be smaller then 100. Only two digit or smaller
 * integers are allowed.
 *
 * 1. `multipart-asset.jpg`
 * 2. `multipart-asset_no02.jpg`
 * 3. `multipart-asset_no03.jpg`
 * 4. ...
 *
 * @param firstFileName - A file name, a path or a URL.
 * @param no - The number in the multipart asset list. The
 *   first element has the number 1.
 */
export function formatMultiPartAssetFileName (firstFileName: string, no: string | number): string {
  if (!Number.isInteger(no)) {
    // throw new Error(`${firstFileName}: The specifed number “${no}” is no integer.`)
    no = 1
  }
  let suffix
  if (no === 1) {
    return firstFileName
  } else if (no < 10) {
    suffix = `_no00${no}`
  } else if (no < 100) {
    suffix = `_no0${no}`
  } else if (no < 1000) {
    suffix = `_no${no}`
  } else {
    throw new Error(`${firstFileName} multipart asset counts greater than 100 are not supported.`)
  }
  return firstFileName.replace(/(\.\w+$)/, `${suffix}$1`)
}

/**
 * Format a Wikidata URL.
 * `https://www.wikidata.org/wiki/Q42`
 */
export function formatWikidataUrl (id: string): string {
  id = String(id)
  const idNumber: number = parseInt(id.replace(/^Q/, ''))
  // https://www.wikidata.org/wiki/Q42
  return `https://www.wikidata.org/wiki/Q${idNumber}`
}

/**
 * Format a Wikipedia URL.
 *
 * https://en.wikipedia.org/wiki/A_Article
 *
 * @param nameSpace - The name space of the Wikipedia article (for
 *   example A_Article or en:A_article)
 */
export function formatWikipediaUrl (nameSpace: string): string {
  // https://de.wikipedia.org/wiki/Gesch%C3%BCtztes_Leerzeichen
  // https://en.wikipedia.org/wiki/Non-breaking_space
  const segments = nameSpace.split(':')
  const lang = segments[0]
  const slug = encodeURIComponent(segments[1])
  return `https://${lang}.wikipedia.org/wiki/${slug}`
}

/**
 * Format a Musicbrainz recording URL.
 *
 * `https://musicbrainz.org/recording/${RecordingId}`
 *
 * @param recordingId
 */
export function formatMusicbrainzRecordingUrl (recordingId: string): string {
  return `https://musicbrainz.org/recording/${recordingId}`
}

/**
 * Format a Musicbrainz work URL.
 *
 * `https://musicbrainz.org/work/${WorkId}`
 *
 * @param workId
 */
export function formatMusicbrainzWorkUrl (workId: string): string {
  return `https://musicbrainz.org/work/${workId}`
}

/**
 * Format a YouTube URL.
 *
 * `https://youtu.be/CQYypFMTQcE`
 *
 * @param id - The id of a Youtube video (for example CQYypFMTQcE).
 */
export function formatYoutubeUrl (id: string): string {
  return `https://youtu.be/${id}`
}

/**
 * `https://imslp.org/wiki/La_clemenza_di_Tito_(Wagenseil,_Georg_Christoph)`
 *
 * @param id - For example
 *   `La_clemenza_di_Tito_(Wagenseil,_Georg_Christoph)`
 */
export function formatImslpUrl (id: string): string {
  return `https://imslp.org/wiki/${id}`
}

/**
 * `https://commons.wikimedia.org/wiki/File:Cheetah_(Acinonyx_jubatus)_cub.jpg`
 *
 * @param fileName - For example
 *   `Cheetah_(Acinonyx_jubatus)_cub.jpg`
 */
export function formatWikicommonsUrl (fileName: string): string {
  return `https://commons.wikimedia.org/wiki/File:${fileName}`
}

/**
 * Get the plain text version of a HTML string.
 *
 * @param html - A HTML formated string.
 *
 * @returns The plain text version.
 */
export function plainText (html: string): string {
  if (!html) return ''
  // To get spaces between heading and paragraphs
  html = html.replace(/></g, '> <')
  const markup = new DOMParser().parseFromString(html, 'text/html')
  return markup.body.textContent || ''
}

interface ShortenTextOptions {
  stripTags: boolean
  maxLength: number
}

/**
 * Shorten a text string. By default the string is shortend to the maximal
 * length 80.
 *
 * @param text
 * @param options
 */
export function shortenText (text: string, { maxLength, stripTags }: ShortenTextOptions) {
  if (!text) return ''
  if (!maxLength) maxLength = 80
  if (stripTags) text = plainText(text)
  if (text.length < maxLength) return text
  // https://stackoverflow.com/a/5454303
  // trim the string to the maximum length
  text = text.substr(0, maxLength)
  // re-trim if we are in the middle of a word
  text = text.substr(0, Math.min(text.length, text.lastIndexOf(' ')))
  return `${text} …`
}

interface SelectionSubsetOption {
  /**
   * `numeric`, or a truety value.
   */
  sort: string | boolean

  /**
   * An array of elements to build a subset
   */
  elements: any[]

  /**
   * If `elements` is undefined, an array with integers is created und
   * used as `elements`.
   */
  elementsCount: number

  /**
   *
   */
  firstElementNo: number

  /**
   * Shift all selector numbers by this number: For example `-1`: `2-5`
   *   is internally treated as `1-4`
   */
  shiftSelector: number
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
 *
 * @returns {Array}
 */
export function selectSubset (subsetSelector: string, { sort, elements, elementsCount, firstElementNo, shiftSelector }: SelectionSubsetOption): any[] {
  const subset = []
  if (!shiftSelector) shiftSelector = 0

  // Create elements
  if (!elements && elementsCount) {
    elements = []
    let firstNo
    if (firstElementNo) {
      firstNo = firstElementNo
    } else {
      firstNo = 0
    }
    const endNo = firstNo + elementsCount
    for (let i = firstNo; i < endNo; i++) {
      elements.push(i)
    }
  }

  if (!subsetSelector) return elements

  // 1, 3, 5 -> 1,3,5
  subsetSelector = subsetSelector.replace(/\s*/g, '')
  // 1-3,5-7
  const ranges = subsetSelector.split(',')

  // for cloze steps: shiftSelector = -1
  // shiftSelectorAdjust = 1
  const shiftSelectorAdjust = -1 * shiftSelector
  for (let range of ranges) {
    // -7 -> 1-7
    if (range.match(/^-/)) {
      const end = parseInt(range.replace('-', ''))
      range = `${1 + shiftSelectorAdjust}-${end}`
    }

    // 7- -> 7-23
    if (range.match(/-$/)) {
      const begin = parseInt(range.replace('-', ''))
      // for cloze steps (shiftSelector: -1): 7- -> 7-23 -> elements.length
      // as 22 elements because 7-23 translates to 6-22.
      range = `${begin}-${elements.length + shiftSelectorAdjust}`
    }

    const rangeSplit: string[] = range.split('-')
    let startEnd: number[]

    if (rangeSplit.length === 2) {
      startEnd = [parseInt(rangeSplit[0]), parseInt(rangeSplit[1])]
    } else {
      startEnd = [parseInt(rangeSplit[0])]
    }

    // 1
    if (startEnd.length === 1) {
      const i = startEnd[0]
      subset.push(elements[i - 1 + shiftSelector])
    // 1-3
    } else if (startEnd.length === 2) {
      const beginNo = startEnd[0] + shiftSelector
      const endNo = startEnd[1] + shiftSelector
      if (endNo <= beginNo) {
        throw new Error(`Invalid range: ${beginNo}-${endNo}`)
      }
      for (let no = beginNo; no <= endNo; no++) {
        const index = no - 1
        subset.push(elements[index])
      }
    }
  }

  if (sort === 'numeric') {
    subset.sort((a, b) => a - b) // For ascending sort
  } else if (sort) {
    subset.sort()
  }

  return subset
}

/**
 * Sort alphabetically an array of objects by some specific properties.
 *
 * @param property - Key of the object to sort.
 * @see {@link https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript Tutorial}
 */
export function sortObjectsByProperty (property: string) {
  return function (a: {[key: string]: any}, b: {[key: string]: any}) {
    return a[property].localeCompare(b[property])
  }
}

/**
 * Format a date specification string into a local date string, for
 * example `28. August 1749`
 *
 * @param dateSpec - A valid input for the `Date()` class. If the input
 *   is invalid the raw `dateSpec` is returned.
 */
export function formatToLocalDate (dateSpec: string): string {
  const date = new Date(dateSpec)
  // Invalid date
  if (isNaN(date.getDay())) return dateSpec
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
  // Not getDay()
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Extract the 4 digit year from a date string
 *
 * @param dateSpec - For example `1968-01-01`
 *
 * @returns for example `1968`
 */
export function formatToYear (dateSpec: string): string {
  return dateSpec.substr(0, 4)
}

/**
 * Format a timestamp into a string like this example: `Mo 17.2.2020 07:57:53`
 *
 * @param timeStampMsec - The timestamp in milliseconds.
 */
export function formatToLocalDateTime (timeStampMsec: number): string {
  const date = new Date(Number(timeStampMsec))
  const dayNumber = date.getDay()
  let dayString
  if (dayNumber === 0) {
    dayString = 'So'
  } else if (dayNumber === 1) {
    dayString = 'Mo'
  } else if (dayNumber === 2) {
    dayString = 'Di'
  } else if (dayNumber === 3) {
    dayString = 'Mi'
  } else if (dayNumber === 4) {
    dayString = 'Do'
  } else if (dayNumber === 5) {
    dayString = 'Fr'
  } else if (dayNumber === 6) {
    dayString = 'Sa'
  }
  const dateString = date.toLocaleDateString()
  const timeString = date.toLocaleTimeString()
  return `${dayString} ${dateString} ${timeString}`
}

/**
 * Convert a duration string (8:01 = 8 minutes 1 seconds or 1:33:12 = 1
 * hour 33 minutes 12 seconds) into seconds.
 *
 * @param duration
 */
export function convertDurationToSeconds (duration: string): number {
  if (typeof duration === 'string' && duration.match(/:/)) {
    const segments = duration.split(':')
    if (segments.length === 3) {
      return parseInt(segments[0]) * 3600 + parseInt(segments[1]) * 60 + parseInt(segments[2])
    } else if (segments.length === 2) {
      return  parseInt(segments[0]) * 60 + parseInt(segments[1])
    }
  }
  return Number.parseFloat(duration)
}

/**
 * Convert a single word into title case, for example `word` gets `Word`.
 *
 * @param text
 */
export function toTitleCase (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
