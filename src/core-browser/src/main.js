/**
 * Base core functionality for the code running in the browser without node.
 * @module @bldr/core-browser
 */

/* globals DOMParser */

/**
 *
 * @param {Number} timeStampMsec
 * @returns {String}
 */
export function toLocaleDateTimeString (timeStampMsec) {
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
 * Convert `snake_case` or `kebab-case` strings into `camelCase` strings.
 *
 * @param {String} str - A snake or kebab cased string
 *
 * @returns {String}
 *
 * @see {@link https://catalin.me/javascript-snake-to-camel/}
 */
function snakeToCamel (str) {
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
