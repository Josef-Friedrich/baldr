import path from 'path'

import { referencify } from '@bldr/core-browser'
import config from '@bldr/config'
import type { MediaCategoriesTypes, MediaResolverTypes } from '@bldr/type-definitions'

interface InstrumentCategory extends MediaCategoriesTypes.Category {
  abbreviation: string
  basePath: string
}

interface InstrumentFileFormat extends MediaResolverTypes.YamlFormat {
  name: string
  extension: string
}

/**
 * The meta data type specification “instrument”.
 */
export const instrument: MediaCategoriesTypes.Category = {
  title: 'Instrument',
  abbreviation: 'IN',
  basePath: path.join(config.mediaServer.basePath, 'Instrumente'),
  relPath: function ({ data }) {
    const instrumentData = data as InstrumentFileFormat
    const id = data.id.replace(/^IN_/, '')
    return path.join(id.substr(0, 1).toLowerCase(), id, `main.${instrumentData.extension}`)
  },
  detectCategoryByPath: function (category) {
    const instrumentCategory = category as InstrumentCategory
    return new RegExp(`^${instrumentCategory.basePath}.*/main\\.jpg$`)
  },
  props: {
    instrumentId: {
      title: 'Instrumenten-ID',
      derive: function ({ data }) {
        return referencify(data.name)
      }
    },
    ref: {
      title: 'ID zur Referenzierung (Präfix „IN_“)',
      derive: function ({ data, category }) {
        // IS: Instrument
        const instrumentCategory = category as InstrumentCategory
        const instrumentData = data as InstrumentFileFormat
        return `${instrumentCategory.abbreviation}_${referencify(instrumentData.name)}`
      },
      overwriteByDerived: true
    },
    title: {
      title: 'Titel des Instruments',
      derive: function ({ data }) {
        const instrumentData = data as InstrumentFileFormat
        return `Foto des Instruments „${instrumentData.name}“`
      },
      overwriteByDerived: true
    },
    name: {
      title: 'Name des Instruments',
      wikidata: {
        fromEntity: 'getLabel'
      },
      required: true
    },
    description: {
      title: 'Titel des Instruments',
      wikidata: {
        fromEntity: 'getDescription',
        alwaysUpdate: false
      }
    },
    mainImage: {
      title: 'Hauptbild',
      wikidata: {
        // Bild
        fromClaim: 'P18',
        format: 'formatWikicommons'
      }
    },
    playingRangeImage: {
      title: 'Bild des Tonumfangs',
      wikidata: {
        // Bild des Tonumfang
        fromClaim: 'P2343',
        format: 'formatWikicommons'
      }
    },
    audioSamples: {
      title: 'Hörproben des Instruments'
    }
  }
}
