<!--
  routes:
  - /presentation/:presRef
  - /presentation/:presRef/preview
-->
<template>
  <div
    class="
      vc_slides_preview
      main-app-fullscreen
    "
    b-content-theme="default"
    :style="{ fontSize: size + 'vw' }"
  >
    <div v-if="presentation">
      <display-controller/>
      <presentation-title/>
      <div v-if="slides">
        <span v-if="layoutCurrent.id === 'grid'">
          <grid-layout
            v-if="hierarchical"
            :slides="presentation.slidesTree"
          />
          <grid-layout
            v-if="!hierarchical"
            :slides="presentation.slides"
          />
        </span>
        <list-layout
          v-if="layoutCurrent.id === 'list'"
          :slides="presentation.slides"
        />
      </div>
    </div>
    <loading-icon v-else/>
  </div>
</template>

<script>
import { routerGuards } from '@/routing.js'
import DisplayController from './DisplayController.vue'
import GridLayout from '@/components/reusable/SlidesPreview/GridLayout.vue'
import ListLayout from './ListLayout.vue'
import LoadingIcon from '@/components/reusable/LoadingIcon.vue'
import PresentationTitle from '@/components/reusable/PresentationTitle.vue'

import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('lamp')
const storePreview = createNamespacedHelpers('lamp/preview')
const mapActionsPreview = storePreview.mapActions
const mapGettersPreview = storePreview.mapGetters

export default {
  name: 'SlidesPreview',
  components: {
    DisplayController,
    GridLayout,
    ListLayout,
    PresentationTitle,
    LoadingIcon
  },
  mounted: function () {
    this.$shortcuts.addMultiple([
      {
        keys: '+',
        callback: this.increaseSize,
        description: 'Folien-Vorschauen vergrößern',
        routeNames: ['slides-preview']
      },
      {
        keys: '-',
        callback: this.decreaseSize,
        description: 'Folien-Vorschauen verkleiner',
        routeNames: ['slides-preview']
      }
    ])
    // Show current slide in the center of the view.
    const elCurrentSlide = document.querySelector('.vc_slide_preview.current-slide')
    if (elCurrentSlide) {
      elCurrentSlide.scrollIntoView({ block: 'center' })
    }
  },
  destroyed: function () {
    this.$shortcuts.removeMultiple(['+', '-'])
  },
  computed: {
    ...mapGetters([
      'presentation',
      'slide',
      'slides',
      'slidesCount'
    ]),
    ...mapGettersPreview([
      'size',
      'layoutCurrent',
      'hierarchical'
    ])
  },
  methods: mapActionsPreview([
    'increaseSize',
    'decreaseSize'
  ]),
  ...routerGuards
}
</script>

<style lang="scss">
  .vc_slides_preview {
    font-size: 1.5vmin;
    padding: 1vw;

    .vc_presentation_title {
      font-size: 2em;

      header {
        font-size: 0.7em;
        text-align: center;
        width: 100%;
      }

      h1, h2 {
        margin-bottom: 0;
        text-align: center;
      }

      h1 {
        font-size: 1.6em;
      }

      h2 {
        font-size: 1.4em;
        font-weight: normal;
        margin-top: 0;
      }
    }
  }
</style>
