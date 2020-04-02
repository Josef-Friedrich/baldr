import vue from '@/main.js'

/**
 * Unfortunatley it is not possible to write a Vue js component tag inline
 * in a presentation file.
 *
 *
 * # Types
 *
 * ## Media asset:
 *
 * `[id:Haydn_Joseph align="left" caption="Joseph Haydn"]`
 *
 * to:
 *
 * ```html
 * <figure class="inline-media inline-left">
 *   <img src="Haydn.jpg">
 *   <figcaption>Joseph Haydn</figcaption>
 * </figure>
 * ```
 *
 * ## Slide link:
 *
 * `[slide:one text="Slide 1"]`
 *
 * to:
 *
 * `<span b-inline-type="slide-link" b-inline-slideid="one" class="link">Slide 1</span>`
 *
 * @module @bldr/lamp/inline-markup
 */

const mediaUriRegExp = '(([a-z]+):([a-zA-Z0-9-_]+))'
export const regExp = '\\[' + mediaUriRegExp + ' ?([^\\]]*)?' + '\\]'

/**
 * A object representation of one inline markup string.
 *
 * ```js
 * const item = new Item('[id:Fuer-Elise caption="Für Elise"]')
 * console.log(item.id) // Fuer-Elise
 * console.log(item.caption) // Für Elise
 * ```
 */
export class Item {
  /**
   * @param {String} markup - for example
   *   `[id:Fuer-Elise caption="Für Elise"]` or
   *   `[id:Beethoven class="left large"]` or
   *   `[id:Mozart center]`
   */
  constructor (markup) {
    const match = markup.match(new RegExp(regExp))
    if (!match) {
      throw new Error(`Invalid inline markup: ${markup}`)
    }
    //  12    3            4
    // [((id):(Fuer-Elise))( caption="Für Elise")]
    this[match[2]] = match[1]

    if (match[4]) {
      const attrs = match[4]
      // 1
      // (center)
      // 1         2 3
      // (caption)=("(Für Elise)")
      const matches = attrs.matchAll(/([a-z]+)(="([^"]*)")?/g)
      for (const match of matches) {
        if (match[3]) {
          this[match[1]] = match[3]
        } else {
          this[match[1]] = true
        }
      }
    }
  }
}

/**
 * Convert the inline markup into HTML.
 *
 * @param {@bldr/lamp/inline-markup~Item} item
 */
export function render (item) {
  if (item.slide) {
    const slide = item.slide.replace(/^[a-z]+:/, '')
    let text
    if (!item.text) {
      text = '[>]'
    } else {
      text = item.text
    }
    return `<span b-inline-type="slide-link" b-inline-slide="${slide}" class="link">${text}</span>`
  } else if (item.id) {
    const mediaFile = vue.$store.getters['media/mediaFileByUri'](item.id)

    let controls = ''
    let htmlTag
    if (mediaFile.type === 'image') {
      htmlTag = 'img'
    } else if (mediaFile.type === 'audio') {
      htmlTag = 'audio'
      controls = 'controls'
    } else if (mediaFile.type === 'video') {
      htmlTag = 'video'
      controls = 'controls'
    }
    const mediaTag = `<${htmlTag} src="${mediaFile.httpUrl}" ${controls}/>`

    let caption = ''
    if (item.caption && typeof item.caption === 'string') {
      caption = `<figcaption>${item.caption}</figcaption>`
    }

    let align = ''
    if (item.align && typeof item.align === 'string') {
      align = `inline-${item.align}`
    }

    return `<figure class="inline-media ${align}">${mediaTag}${caption}</figure>`
  }
}

/**
 * This function has to be called on master slides containing inline
 * markup.
 */
export function makeReactive () {
  const presentation = vue.$get('presentation')
  const elements = document.querySelectorAll('[b-inline-type]')

  for (const element of elements) {
    const type = element.getAttribute('b-inline-type')

    if (type === 'slide-link') {
      const slideId = element.getAttribute('b-inline-slide')
      element.addEventListener('click', () => {
        presentation.goto(slideId)
      })
    }
  }
}

export default {
  makeReactive,
  render,
  Item,
  regExp
}