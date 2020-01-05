
import { markupToHtml, displayElementByStepNo } from '@/lib.js'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('presentation')

const example = `
---
slides:

- title: Shortcuts
  svg:
    src: id:Requiem_NB_Confutatis_1-Takt
    step_exclude: 1

- title: Kurzform
  svg: id:Notenbeispiel_Freude-schoener-Goetterfunken

- title: Langform
  svg:
    src: id:Notenbeispiel_Freude-schoener-Goetterfunken_Anfang

- title: g Element
  svg:
    src: id:NB_Dreiklaenge-Nationalhymnen_F-Dur
    step_exclude: 1

- title: class
  svg:
    src: id:Moses_Notationsweisen
    step_selector: .baldr-group
`

export default {
  title: 'Bild',
  props: {
    src: {
      type: String,
      required: true,
      description: 'Den URI zu einer SVG-Datei.',
      mediaFileUri: true
    },
    stepSelector: {
      default: 'g',
      description: 'Selektor, der Elemente auswählt, die als Schritte eingeblendet werden sollen.'
    },
    stepExclude: {
      type: [Array, Number],
      description: 'Schritt-Number der Elemente, die nicht als Schritte eingeblendet werden sollen. (z. B. 1, oder [1, 2, 3])'
    }
  },
  icon: {
    name: 'image',
    color: 'blue',
    showOnSlides: false
  },
  styleConfig: {
    centerVertically: true,
    darkMode: false
  },
  example,
  normalizeProps (props) {
    if (typeof props === 'string') {
      props = { src: props }
    }
    if ('stepExclude' in props && typeof props.stepExclude === 'number') {
      props.stepExclude = [props.stepExclude]
    }
    return props
  },
  resolveMediaUris (props) {
    return [props.src]
  },
  async enterSlide () {
    let response = await this.$media.httpRequest.request({
      url: `/media/${this.mediaFile.path}`,
      method: 'get'
    })
    const svg = this.$refs.svgWrapper
    svg.innerHTML = response.data
    this.elGroups = svg.querySelectorAll(this.stepSelector)
    this.elGroups = this.removeElementsFromSteps(this.elGroups, this.stepExclude)
    this.slideCurrent.renderData.stepCount = this.elGroups.length + 1
    displayElementByStepNo({
      elements: this.elGroups,
      stepNo: this.slideCurrent.renderData.stepNoCurrent
    })
    this.shortcutsRegister(this.elGroups)
  },
  leaveSlide () {
    if ('shortcutsUnregister' in this) this.shortcutsUnregister(this.elGroups)
  },
  enterStep ({ oldStepNo, newStepNo }) {
    displayElementByStepNo({
      elements: this.elGroups,
      oldStepNo,
      stepNo: newStepNo
    })
  }
}
