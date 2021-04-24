import type { MediaCategory } from '@bldr/type-definitions'

import { validateMediaId, validateUuid } from '../main'

/**
 * The meta data type specification “recording”.
 */
export const recording: MediaCategory.Category = {
  title: 'Aufnahme',
  detectCategoryByPath: new RegExp('^.*/HB/.*(m4a|mp3)$'),
  props: {
    artist: {
      title: 'Interpret',
      description: 'Der/die Interpret/in eines Musikstücks.',
      wikidata: {
        // Interpret | Interpretin | Interpretinnen | Darsteller
        fromClaim: 'P175',
        secondQuery: 'queryLabels',
        format: 'formatList'
      }
    },
    musicbrainzRecordingId: {
      title: 'MusicBrainz-Aufnahme-ID',
      validate: validateUuid,
      wikidata: {
        fromClaim: 'P4404',
        format: 'formatSingleValue'
      }
    },
    // see composition creationDate
    year: {
      title: 'Jahr',
      state: 'absent'
      // wikidata: {
      //   // Veröffentlichungsdatum
      //   fromClaim: 'P577',
      //   format: 'formatYear'
      // }
    },
    cover: {
      title: 'Vorschau-Bild',
      validate: validateMediaId
    },
    coverSource: {
      title: 'Cover-Quelle',
      description: 'HTTP-URL des Vorschau-Bildes.',
      validate (value) {
        return value.match(/^https?.*$/)
      }
    }
  }
}