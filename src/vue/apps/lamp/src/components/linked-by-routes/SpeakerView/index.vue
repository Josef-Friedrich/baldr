<template>
  <div class="vc_speaker_view main-app-fullscreen" b-ui-theme="default" v-if="presentation">
    <presentation-title/>

    <div class="slide-panel" v-if="slide">
      <slide-main id="current-slide" :slide="slide" :step-no="currentStepNo"/>
      <div>
        <slide-main id="next-slide" :slide="nextSlide" :step-no="nextStepNo" :is-public="false"/>
        <slide-steps/>
      </div>
    </div>

    <grid-layout :slides="presentation.slides"/>

    <router-link
      class="open-public-view"
      :to="publicViewRoute"
      target="_blank"
      title="zusätzliche Präsentations-Ansicht öffnen"
    >
      <plain-icon name="presentation"/>
    </router-link>

    <cursor-arrows/>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { routerGuards, switchRouterView } from '@/routing.js'
import CursorArrows from '@/components/reusable/CursorArrows.vue'
import GridLayout from '@/components/reusable/SlidesPreview/GridLayout.vue'
import PresentationTitle from '@/components/reusable/PresentationTitle'
import SlideMain from '@/components/reusable/SlideMain/index.vue'
import SlideSteps from './SlideSteps.vue'

const { mapGetters } = createNamespacedHelpers('lamp')
const mapGettersNav = createNamespacedHelpers('lamp/nav').mapGetters

export default {
  name: 'SpeakerView',
  components: {
    CursorArrows,
    GridLayout,
    PresentationTitle,
    SlideMain,
    SlideSteps
  },
  computed: {
    ...mapGetters(['slide', 'presentation', 'slides']),
    ...mapGettersNav(['nextRouterParams']),
    nextSlideRouterParams () {
      return this.nextRouterParams(1)
    },
    nextSlide () {
      const params = this.nextSlideRouterParams
      return this.slides[params.slideNo - 1]
    },
    currentStepNo () {
      return this.slide.stepNo
    },
    nextStepNo () {
      return this.nextSlideRouterParams.stepNo
    },
    publicViewRoute () {
      return switchRouterView(this.$route)
    }
  },
  methods: {
    sendMessage () {
      this.$socket.sendObj({ presRef: 'Futurismus' })
    }
  },
  ...routerGuards
}
</script>

<style lang="scss">
  .vc_speaker_view {
    padding: 1em;

    .slide-panel {
      display: flex;
      font-size: 0.2vw;
      justify-content: space-between;
      padding: 1em;
    }

    #current-slide {
      font-size: 6em;
    }

    #next-slide {
      font-size: 4em;
    }

    .vc_slide_main {
      border: solid $black 1px;
      height: 30em;
      width: 40em;

      // See styling:
      // - components/SlideMain/MasterIcon.vue (Basic styling)
      // - routes/SpeakerView/index.vue (Adjustments for the speaker view)
      // - routes/SlideView/index.vue (Adjustments for the main slide view)
      .vc_master_icon {
        font-size: 3em;
        height: 1em;
        line-height: 1em;
        left: 0.2em;
        top: 0.2em;

        &.small {
          font-size: 2em;
        }

        &.large {
          font-size: 4em;
        }
      }
      .vc_external_sites {
        font-size: 1em;
      }
    }

    .vc_slide_steps {
      width: 40em;
    }

    .vc_master_renderer {
      height: 30em;
    }

    .vc_slide_preview {
      font-size: 0.3em;
    }

    .vc_presentation_title {
      ul, h1, h2, nav {
        display: inline;
        font-size: 0.7em;
        margin: 0;
        padding: 0;
      }

      h1, h2 {
        &:before {
          content: ' / '
        }
      }

      h2 {
        font-size: 0.6em;
      }
    }

    .left-bottom-corner, .vc_audio_overlay {
      bottom: 0.5em;
      left: 0.5em;
      position: absolute;
      z-index: 1;
    }

    .vc_play_button {
      font-size: 1em;
    }

    .open-public-view {
      bottom: 0.3em;
      left: 0.3em;
      position: fixed;
    }
  }
</style>
