/**
 *
 * @see {@link https://github.com/FranckFreiburger/vue-pdf}
 *
 * @module @bldr/lamp/masters/document
 */

import { validateMasterSpec } from '@bldr/lamp-core'

export default validateMasterSpec({
  name: 'document',
  title: 'Dokument',
  propsDef: {
    src: {
      type: String,
      description: 'URI eines Dokuments.'
    },
    page: {
      type: Number,
      description: 'Nur eine Seite des PDFs anzeigen'
    }
  },
  icon: {
    name: 'file-outline',
    color: 'gray'
  },
  styleConfig: {
    centerVertically: false,
    darkMode: true,
    contentTheme: 'default'
  },
  hooks: {
    normalizeProps (props) {
      if (typeof props === 'string') {
        props = {
          src: props
        }
      }
      return props
    },
    resolveMediaUris (props) {
      return props.src
    },
    collectPropsMain (props) {
      const asset = this.$store.getters['media/assetByUri'](props.src)
      const output = {
        asset
      }
      if (props.page) {
        output.page = props.page
      }
      return output
    },
    calculateStepCount ({ propsMain }) {
      if (propsMain.page) return 1
      const asset = propsMain.asset
      if (asset.yaml.pageCount != null && asset.yaml.pageCount > 1) {
        return asset.yaml.pageCount
      }
    },
    titleFromProps ({ propsMain }) {
      if (propsMain.asset.yaml.title != null) {
        return propsMain.asset.title
      }
    }
    // Fit into slide main
    // afterStepNoChangeOnComponent () {
    //   if (this.$refs.pdfViewer) {
    //     const pdf = this.$refs.pdfViewer.$el
    //     const parentHeight = this.$parent.$parent.$el.clientHeight
    //     this.$nextTick(() => {
    //       const width = pdf.clientWidth / pdf.clientHeight * parentHeight
    //       if (width <= this.$el.clientWidth) {
    //         pdf.style.width = `${width}px`
    //       }
    //     })
    //   }
    // }
  }
})
