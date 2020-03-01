/**
 * Base core functionality for the code running in the browser without node.
 *
 * Run `npm run build` to build the node version of this code. The node
 * version uses the CommonJS module system instead of the ES module system.
 *
 * @module @bldr/core-browser
 */

/* globals DOMParser */

/**
 * Sort alphabetically an array of objects by some specific properties.
 *
 * @param {String} property - Key of the object to sort.
 * @see {@link https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript Tutorial}
 */
export function sortObjectsByProperty (property) {
  return function (a, b) {
    return a[property].localeCompare(b[property])
  }
}

/**
 * Format a date specification string into a local date string, for example
 * `28. August 1749`
 *
 * @param {String} dateSpec - A valid input for the `Date()` class. If the
 *   input is invalid the raw `dateSpec` is returned.
 *
 * @returns {String}
 */
export function formatToLocalDate (dateSpec) {
  const date = new Date(dateSpec)
  // Invalid date
  if (isNaN(date.getDay())) return dateSpec
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
  return `${date.getDay()}. ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Format a timestamp into a string like this example: `Mo 17.2.2020 07:57:53`
 *
 * @param {Number} timeStampMsec - The timestamp in milliseconds.
 *
 * @returns {String}
 */
export function formatToLocalDateTime (timeStampMsec) {
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
 *
 * @param {String} html
 *
 * @returns {String}
 */
export function plainText (html) {
  // To get spaces between heading and paragraphs
  html = html.replace(/></g, '> <')
  const markup = new DOMParser().parseFromString(html, 'text/html')
  return markup.body.textContent || ''
}

/**
 * @param {String} text
 * @param {Object} options
 *
 * @returns {String}
 */
export function shortenText (text, options = {}) {
  if (!text) return ''
  let { maxLength, stripTags } = options
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

/**
 * Convert `camelCase` into `snake_case` strings.
 *
 * @param {String} str - A camel cased string.
 *
 * @returns {String}
 *
 * @see {@link https://vladimir-ivanov.net/camelcase-to-snake_case-and-vice-versa-with-javascript/}
 */
export function camelToSnake (str) {
  return str.replace(/[\w]([A-Z])/g, function (m) {
    return m[0] + '_' + m[1]
  }).toLowerCase()
}

/**
 * Convert `snake_case` or `kebab-case` strings into `camelCase` strings.
 *
 * @param {String} str - A snake or kebab cased string
 *
 * @returns {String}
 *
 * @see {@link https://catalin.me/javascript-snake-to-camel/}
 */
export function snakeToCamel (str) {
  return str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  )
}

/**
 * Convert all properties in an object to camelCase in a recursive fashion.
 *
 * @param {Object} object
 *
 * @returns {Object}
 */
export function convertPropertiesToCamelCase (object) {
  // Array
  if (Array.isArray(object)) {
    for (const item of object) {
      if (typeof object === 'object') {
        convertPropertiesToCamelCase(item)
      }
    }
  // Object
  } else if (typeof object === 'object') {
    for (const snakeCase in object) {
      const camelCase = snakeToCamel(snakeCase)
      if (camelCase !== snakeCase) {
        const value = object[snakeCase]
        object[camelCase] = value
        delete object[snakeCase]
      }
      // Object or array
      if (typeof object[camelCase] === 'object') {
        convertPropertiesToCamelCase(object[camelCase])
      }
    }
  }
  return object
}

/**
 * Generate from the file name or the url of the first element of a multipart
 * asset the nth file name or the url. The parameter `firstFileName` must
 * have a extension (for example `.jpg`). The parameter `no` must be smaller
 * then 100. Only two digit or smaller integers are allowed.
 *
 * 1. `multipart-asset.jpg`
 * 2. `multipart-asset_no02.jpg`
 * 3. `multipart-asset_no03.jpg`
 * 4. ...
 *
 * @param {String} firstFileName - A file name, a path or a URL.
 * @param {Number} no - The number in the multipart asset list. The first
 *   element has the number 1.
 *
 * @returns {String}
 */
export function formatMultiPartAssetFileName (firstFileName, no) {
  if (!Number.isInteger(no)) {
    throw new Error(`${firstFileName}: The specifed number “${no}” is no integer.`)
  }
  let suffix
  if (no === 1) {
    return firstFileName
  } else if (no < 10) {
    suffix = `_no0${no}`
  } else if (no < 100) {
    suffix = `_no${no}`
  } else {
    throw new Error(`${firstFileName} multipart asset counts greater than 100 are not supported.`)
  }
  return firstFileName.replace(/(\.\w+$)/, `${suffix}$1`)
}

/**
 * https://www.wikidata.org/wiki/Q42
 *
 * @returns {String}
 */
export function formatWikidataUrl (id) {
  id = String(id)
  id = parseInt(id.replace(/^Q/, ''))
  // https://www.wikidata.org/wiki/Q42
  return `https://www.wikidata.org/wiki/Q${id}`
}

/**
 * https://en.wikipedia.org/wiki/A_Article
 *
 * @param {String} nameSpace - The name space of the Wikipedia article (for
 *   example A_Article or en:A_article)
 *
 * @returns {String}
 */
export function formatWikipediaUrl (nameSpace) {
  // https://de.wikipedia.org/wiki/Gesch%C3%BCtztes_Leerzeichen
  // https://en.wikipedia.org/wiki/Non-breaking_space
  const segments = nameSpace.split(':')
  const lang = segments[0]
  const slug = encodeURIComponent(segments[1])
  return `https://${lang}.wikipedia.org/wiki/${slug}`
}

/**
 * https://youtu.be/CQYypFMTQcE
 *
 * @param {String} id - The id of a Youtube video (for example CQYypFMTQcE).
 *
 * @returns {String}
 */
export function formatYoutubeUrl (id) {
  return `https://youtu.be/${id}`
}

/**
 * Categories some asset file formats in three asset types: `audio`, `image`,
 * `video`.
 */
export class AssetTypes {
  constructor (config) {
    /**
     * @type {object}
     * @private
     */
    this.config_ = config.mediaServer.assetTypes

    /**
     * @type {object}
     * @private
     */
    this.allowedExtensions_ = this.spreadExtensions_()
  }

  /**
   * @private
   */
  spreadExtensions_ () {
    const out = {}
    for (const type in this.config_) {
      for (const extension of this.config_[type].allowedExtensions) {
        out[extension] = type
      }
    }
    return out
  }

  /**
   * Get the media type from the extension.
   *
   * @param {String} extension
   *
   * @returns {String}
   */
  extensionToType (extension) {
    extension = extension.toLowerCase()
    if (extension in this.allowedExtensions_) {
      return this.allowedExtensions_[extension]
    }
    throw new Error(`Unkown extension “${extension}”`)
  }

  /**
   * Get the color of the media type.
   *
   * @param {String} type - The asset type: for example `audio`, `image`,
   *   `video`.
   *
   * @returns {String}
   */
  typeToColor (type) {
    return this.config_[type].color
  }

  /**
   * Determine the target extension (for a conversion job) by a given
   * asset type.
   *
   * @param {String} type - The asset type: for example `audio`, `image`,
   *   `video`.
   *
   * @returns {String}
   */
  typeToTargetExtension (type) {
    return this.config_[type].targetExtension
  }

  /**
   * Check if file is an supported asset format.
   *
   * @param {String} filename
   *
   * @returns {Boolean}
   */
  isAsset (filename) {
    const extension = filename.split('.').pop().toLowerCase()
    if (extension in this.allowedExtensions_) {
      return true
    }
    return false
  }
}

/**
 * Select a subset of elements by a string (`subsetSelector`). `1` is the first
 * element of the `elements` array.
 *
 * - `` (emtpy string or a falsy value): All elements
 * - `1`: The first element
 * - `1,3,5`:
 * - `1-3,5-7`
 * - `-7`:
 * - `7-`
 *
 * @param {String} subsetSelector - See above.
 * @param {object} options
 * @property {String|boolean} options.sort - `numeric`, or a truety value.
 * @property {Array} options.elements - An array of elements to build a subset
 *   from.
 * @property {Number} options.elementsCount - If `elements` is undefined, an
 *   array with integers is created und used as `elements`.
 * @property {Number} options.firstElementNo
 * @property {Number} options.shiftSelector - Shift all selector numbers by
 *   this number: For example `-1`: `2-5` is internally treated as `1-4`
 *
 * @returns {Array}
 */
export function selectSubset (subsetSelector, { sort, elements, elementsCount, firstElementNo, shiftSelector }) {
  const subset = []

  if (!shiftSelector) shiftSelector = 0

  function addElement (element) {
    // Because of the shiftSelector, the first element can be undefined.
    if (!element) return
    if (!subset.includes(element)) {
      subset.push(element)
    }
  }

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

  for (let range of ranges) {
    // -7 -> 1-7
    if (range.match(/^-/)) {
      const end = parseInt(range.replace('-', ''))
      range = `1-${end}`
    }

    // 7- -> 7-23
    if (range.match(/-$/)) {
      const begin = parseInt(range.replace('-', ''))
      range = `${begin}-${elements.length}`
    }

    range = range.split('-')
    // 1
    if (range.length === 1) {
      const i = range[0]
      addElement(elements[i - 1 + shiftSelector])
    // 1-3
    } else if (range.length === 2) {
      const beginNo = parseInt(range[0]) + shiftSelector
      const endNo = parseInt(range[1]) + shiftSelector
      if (endNo <= beginNo) {
        throw new Error(`Invalid range: ${beginNo}-${endNo}`)
      }
      for (let no = beginNo; no <= endNo; no++) {
        const index = no - 1
        addElement(elements[index])
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
 * @see {@link https://coderwall.com/p/ostduq/escape-html-with-javascript}
 */
export function escapeHtml (htmlString) {
  // List of HTML entities for escaping.
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  // Regex containing the keys listed immediately above.
  const htmlEscaper = /[&<>"'\/]/g

  // Escape a string for HTML interpolation.
  return ('' + htmlString).replace(htmlEscaper, function (match) {
    return htmlEscapes[match]
  })
}

/**
 *
 */
export function deepCopy (data) {
  return JSON.parse(JSON.stringify(data))
}

/**
 * @link {@see https://www.npmjs.com/package/js-yaml}
 */
export const jsYamlConfig = {
  noArrayIndent: true,
  lineWidth: 72,
  noCompatMode: true
}
