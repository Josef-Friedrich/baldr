/**
 * This module bundles all routing related code.
 *
 * - Set the document title by the current route.
 *
 * @module @bldr/lamp/routing
 */

/**
 * The route object of the Vue Router package.
 *
 * @see {@link https://router.vuejs.org/api/#the-route-object Vue Router Api documentation}
 *
 * @typedef route
 */

/**
 * An instance of the Vue Router.
 *
 * @see {@link https://router.vuejs.org/api/#router-construction-options Vue Router Api documentation}
 *
 * @typedef router
 */

/**
 * A Vue instance. A Vue instance is essentially a ViewModel as defined in the
 * MVVM pattern, hence the variable name `vm` you will see throughout the docs.
 *
 * @see {@link https://v1.vuejs.org/guide/instance.html}
 *
 * @typedef vm
 */

/**
 * Routes can be divided into two categories: A public route (visible for
 * the audience) and speaker router (visible only for the speaker). Possible
 * values: `public` or `speaker`.
 *
 * @typedef {string} view
 */

import store from '@/store/index.js'
import { router } from '@/routes.js'

/* globals document */

/**
 * @param {module:@bldr/lamp/routing/route} route
 */
function setDocumentTitleByRoute (route) {
  const slide = store.getters['lamp/slide']
  const presentation = store.getters['lamp/presentation']

  if (slide && slide.title && (route.name === 'slide' || route.name === 'slide-step-no')) {
    document.title = `${presentation.title}: Folie Nr. ${slide.no} ${slide.title}`
  } else if (route.meta && route.meta.title) {
    document.title = route.meta.title
  } else {
    document.title = 'Lamp'
  }
}

/**
 * @param {module:@bldr/lamp/routing~router} router
 */
export function installDocumentTitleUpdater (router) {
  router.afterEach((to, from) => {
    setDocumentTitleByRoute(to)
  })
}

/**
 * @type {Object}
 */
export const routerViews = {
  public: {
    slideNo: 'slide',
    stepNo: 'slide-step-no'
  },
  speaker: {
    slideNo: 'speaker-view',
    stepNo: 'speaker-view-step-no'
  }
}

/**
 * @returns {module:@bldr/lamp/routing~view}
 */
export function getViewFromRoute () {
  const name = router.currentRoute.name
  if (name === 'speaker-view' || name === 'speaker-view-step-no') {
    return 'speaker'
  }
  return 'public'
}

/**
 * @param {module:@bldr/lamp/routing~vm} vm
 * @param {String} presId - Presentation ID.
 */
async function loadPresentationById (vm, presId) {
  vm.$media.player.stop()
  vm.$store.dispatch('media/clear')
  vm.$store.commit('lamp/setPresentation', null)

  // EP: Example
  if (presId.match(/^EP_.*$/)) {
    // master example
    const masterMatch = presId.match(/^EP_master_(.*)$/)
    if (masterMatch) {
      const masterName = masterMatch[1]
      const master = vm.$masters.get(masterName)
      await vm.$store.dispatch('lamp/openPresentation', { rawYamlString: master.example })
      return
    }

    // common example
    const commonMatch = presId.match(/^EP_common_(.*)$/)
    if (commonMatch) {
      const commonName = commonMatch[1]
      await vm.$store.dispatch('lamp/openPresentation', {
        rawYamlString: vm.$store.getters['lamp/rawYamlExamples'].common[commonName]
      })
      return
    }
  }

  await vm.$store.dispatch('lamp/openPresentationById', presId)
}

/**
 * Open a presentation by its ID.
 *
 * @param {module:@bldr/lamp/routing~vm} vm
 * @param {module:@bldr/lamp/routing~route} route
 */
async function loadPresentationByRoute (vm, route) {
  try {
    if (route.params.presId) {
      const presentation = vm.$store.getters['lamp/presentation']
      if (!presentation || (presentation && presentation.id !== route.params.presId)) {
        await loadPresentationById(vm, route.params.presId)
      }
      if (route.params.slideNo) {
        if (route.params.stepNo) route.params.stepNo = parseInt(route.params.stepNo)
        vm.$store.dispatch('lamp/nav/setNavListNosByRoute', route)
      }
    }
  } catch (error) {
    vm.$notifyError(error)
  }
}

/**
 * Router guards for some components which can be accessed by router links.
 *
 * Components which use this router guards:
 *
 * - `SlidePreview`
 * - `SlideView`
 * - `SpeakerView`
 */
export const routerGuards = {
  // To be able to enter a presentation per HTTP link on a certain slide.
  // Without this hook there are webpack errors.
  beforeRouteEnter (to, from, next) {
    next(vm => {
      loadPresentationByRoute(vm, to)
    })
  },
  // To be able to navigate throught the slide (only the params) are changing.
  beforeRouteUpdate (to, from, next) {
    loadPresentationByRoute(this, to)
    // To update the URL in the browser URL textbox.
    next()
  }
}
