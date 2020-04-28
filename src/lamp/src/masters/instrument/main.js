/**
 * @module @bldr/lamp/masters/instrument
 */

import { GrabFromObjects } from '@/lib.js'
import { WrappedSamples } from '@bldr/media-client'

export default {
  title: 'Instrument',
  props: {
    instrumentId: {
      type: String,
      description: 'Die ID des Instruments. Gleichlautend wie der Ordner in dem alle Medieninhalte liegen (z. B. Floete)'
    },
    mainImageUri: {
      type: String,
      description: 'URI des Hauptbildes.'
    }
  },
  icon: {
    name: 'trumpet',
    color: 'gray'
  },
  styleConfig: {
    centerVertically: true,
    darkMode: true
  },
  hooks: {
    normalizeProps (props) {
      let normalized
      if (typeof props === 'string') {
        normalized = {
          instrumentId: props
        }
      } else {
        normalized = props
      }
      normalized.mainImageUri = `id:IN_${normalized.instrumentId}`
      return normalized
    },
    resolveMediaUris (props) {
      return props.mainImageUri
    },
    collectPropsMain (props) {
      const mainImage = this.$store.getters['media/assetByUri'](props.mainImageUri)
      const grab = new GrabFromObjects(props, mainImage, false)
      const propsMain = grab.multipleProperties(['name'])
      propsMain.imageHttpUrl = mainImage.httpUrl
      if (mainImage.audioSamples) {
        propsMain.wrappedSamples = new WrappedSamples(mainImage.audioSamples)
      }
      return propsMain
    },
    collectPropsPreview ({ propsMain }) {
      return {
        imageHttpUrl: propsMain.imageHttpUrl,
        name: propsMain.name
      }
    },
    titleFromProps (props) {
      return props.instrumentId
    },
    async enterSlide ({ newProps }) {
      if (newProps.audioSamples && newProps.audioSamples.length) {
        this.$media.player.load(newProps.audioSamples[0])
      }
    }
  }
}
