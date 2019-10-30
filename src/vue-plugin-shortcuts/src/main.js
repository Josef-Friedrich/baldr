/**
 * Wrapper functions around mousetrap
 * @module @bldr/vue-plugin-shortcuts
 */

import Mousetrap from 'mousetrap'
import Vue from 'vue'
import ShortcutsOverview from './ShortcutsOverview.vue'

// https://github.com/ccampbell/mousetrap/blob/master/plugins/pause/mousetrap-pause.js

var _originalStopCallback = Mousetrap.prototype.stopCallback

Mousetrap.prototype.stopCallback = function (e, element, combo) {
  var self = this

  if (self.paused) {
    return true
  }

  return _originalStopCallback.call(self, e, element, combo)
}

Mousetrap.prototype.pause = function () {
  var self = this
  self.paused = true
}

Mousetrap.prototype.unpause = function () {
  var self = this
  self.paused = false
}

Mousetrap.init()

const state = {}

const getters = {
  all: (state) => {
    return state
  }
}

const mutations = {
  add (state, shortcut) {
    // if (shortcut.keys in state) {
    //   throw new Error(`Keyboard shortcut “${shortcut.keys}” “${shortcut.description}” already taken.`)
    // }
    Vue.set(state, shortcut.keys, shortcut)
  },
  remove (state, keys) {
    Vue.delete(state, keys)
  }
}

const storeModule = {
  namespaced: true,
  state,
  getters,
  mutations
}

/**
 *
 */
class Shortcuts {
  constructor (router, store) {
    this.$router = router
    this.$store = store

    if (this.$router) {
      const route = {
        path: '/shortcuts',
        meta: {
          shortcut: 'ctrl+h'
        },
        name: 'shortcuts',
        component: ShortcutsOverview
      }
      this.addRoute(route)
      this.fromRoutes()
    }
  }

  add (keys, callback, description) {
    const prevent = () => {
      callback()
      // Prevent default
      // As a convenience you can also return false in your callback:
      return false
    }
    Mousetrap.bind(keys, prevent)
    if (this.$store) this.$store.commit('shortcuts/add', { keys, description })
  }

  /**
   * @param {array} shortcuts
   */
  addMultiple (shortcuts) {
    for (const shortcut of shortcuts) {
      this.add(shortcut.keys, shortcut.callback, shortcut.description)
    }
  }

  remove (keys) {
    Mousetrap.unbind(keys)
    if (this.$store) this.$store.commit('shortcuts/remove', keys)
  }

  addRoute (route) {
    this.$router.addRoutes([route])
    this.$router.options.routes.push(route)
  }

  fromRoute (route) {
    if ('meta' in route && 'shortcut' in route.meta) {
      let routeTitle
      if ('title' in route.meta) {
        routeTitle = route.meta.title
      } else if ('name' in route) {
        routeTitle = route.name
      } else {
        routeTitle = route.path
      }
      let key
      if (route.meta.shortcut.length === 1) {
        key = `g ${route.meta.shortcut}`
      } else {
        key = route.meta.shortcut
      }
      this.add(
        key,
        () => {
          // To avoid uncaught exception object when navigation to a already
          // loaded route.
          if (this.$router.currentRoute.path !== route.path) {
            this.$router.push(route.path)
          }
        },
        `Go to route: ${routeTitle}`
      )
    }
  }

  /**
   * @param {object} router - The router object of the Vue router (this.$router)
   */
  fromRoutes () {
    for (const route of this.$router.options.routes) {
      this.fromRoute(route)
    }
  }

  pause () {
    Mousetrap.pause()
  }

  unpause () {
    Mousetrap.unpause()
  }
}

// https://stackoverflow.com/a/56501461
// Vue.use(shortcuts, router, store)
const Plugin = {
  install (Vue, router, store) {
    if (!router) throw new Error('Pass in an instance of “VueRouter”.')
    if (store) store.registerModule('shortcuts', storeModule)
    /**
     * $shortcuts
     * @memberof module:@bldr/vue-app-presentation~Vue
     * @type {module:@bldr/vue-plugin-shortcuts~Shortcuts}
     */
    Vue.prototype.$shortcuts = new Shortcuts(router, store)
  }
}

export default Plugin