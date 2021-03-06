/**
 * @module @bldr/lamp/masters/person
 */

import type { LampTypes } from '@bldr/type-definitions'
import { validateMasterSpec } from '@bldr/lamp-core'

import * as tex from '@bldr/tex-templates'

function convertPersonIdToMediaId (personId: string): string {
  return `ref:PR_${personId}`
}

export default validateMasterSpec({
  name: 'person',
  title: 'Porträt',
  propsDef: {
    personId: {
      type: String,
      description: 'Personen-ID (z. B. Beethoven_Ludwig-van).'
    }
  },
  icon: {
    name: 'person',
    color: 'orange'
  },
  styleConfig: {
    centerVertically: true,
    darkMode: true
  },
  hooks: {
    normalizeProps (props): LampTypes.StringIndexedData {
      if (typeof props === 'string') {
        return {
          personId: props
        }
      }
      return props
    },
    resolveMediaUris (props): string {
      return convertPersonIdToMediaId(props.personId)
    },
    collectPropsMain (props): LampTypes.StringIndexedData {
      const asset = this.$store.getters['media/assetByUri'](convertPersonIdToMediaId(props.personId))
      return { asset }
    },
    titleFromProps ({ propsMain }): string {
      return propsMain.asset.yaml.name
    },
    generateTexMarkup ({ props, propsMain, propsPreview }): string {
      const yaml = propsMain.asset.yaml
      return tex.environment('baldrPerson', yaml.shortBiography, {
        name: yaml.name
      })
    }
  }
})
