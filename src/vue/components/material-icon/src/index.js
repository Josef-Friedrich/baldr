/**
 * @module @bldr/vue-component-material-icon
 */
import material from './MaterialIcon.vue'
import plain from './PlainIcon.vue'

import iconsJson from './icons.json'

export const icons = iconsJson
export const MaterialIcon = material
export const PlainIcon = plain

const Plugin = {
  install (Vue) {
    Vue.component('material-icon', material)
    Vue.component('plain-icon', plain)
  }
}

export default Plugin
