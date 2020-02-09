import { GrabFromObjects } from '@/lib.js'

export default {
  title: 'Porträt',
  props: {
    name: {
      type: String,
      description: 'Der Name der Person',
      required: true
    },
    image: {
      type: String,
      required: true,
      mediaFileUri: true,
      description: 'Eine URI zu einer Bild-Datei.'
    },
    birth: {
      type: [String, Number],
      description: 'Datumsangabe zum Geburtstag.'
    },
    death: {
      type: [String, Number],
      description: 'Datumsangabe zum Todestag.'
    },
    shortBiography: {
      type: String,
      description: 'Kurzbiographie. Ein, zwei Sätze über die Person.'
    }
  },
  icon: {
    name: 'clipboard-account',
    color: 'orange'
  },
  styleConfig: {
    centerVertically: true,
    darkMode: true
  },
  normalizeProps (props) {
    if (typeof props === 'string') {
      return {
        image: props
      }
    }
    return props
  },
  resolveMediaUris (props) {
    return [props.image]
  },
  titleFromProps (props) {
    if ('name' in props) {
      return props.name
    } else {
      return props.image
    }
  },
  collectPropsMain (props) {
    const image = this.$store.getters['media/mediaFileByUri'](props.image)
    const grab = new GrabFromObjects(props, image, false)
    const result = grab.multipleProperties(
      ['name', 'birth', 'death', 'shortBiography', 'wikipedia', 'wikidata']
    )
    if (result.birth) result.birth = `* ${result.birth}`
    if (result.death) result.death = `† ${result.death}`
    if (result.shortBiography) result.shortBiography = `… ${result.shortBiography}`
    result.imageHttpUrl = image.httpUrl
    return result
  },
  collectPropsPreview ({ propsMain }) {
    return {
      imageHttpUrl: propsMain.imageHttpUrl,
      name: propsMain.name
    }
  }
}
