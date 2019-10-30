// eslint-disable-next-line
/* globals localStorage config */

import { toLocaleDateTimeString } from '../../lib.js'
import { getDefaultServers, HttpRequest } from '@bldr/http-request'

const defaultServers = getDefaultServers()
// remote first
const servers = {
  remote: defaultServers.remote,
  local: defaultServers.local
}

const httpRequest = new HttpRequest(servers, '/api/seating-plan')

class InitState {
  constructor () {
    this.apiVersion = null
    this.externalStateDates = []
    this.importInProgress = true
    this.latestExternalState = {}
    this.latestLocalState = {}
    this.localStateDates = []
    this.stateChanged = false
    this.timeStampMsec = 0
  }
}

const state = new InitState()

const getters = {
  apiVersion: (state) => {
    return state.apiVersion
  },
  externalStateDates: (state) => {
    return state.externalStateDates
  },
  importInProgress: (state) => {
    return state.importInProgress
  },
  latestExternalState: (state) => {
    if (state.latestExternalState.timeStampMsec) {
      return state.latestExternalState
    }
    return { timeStampMsec: 0 }
  },
  latestLocalState: (state) => {
    if (state.latestLocalState.timeStampMsec) {
      return state.latestLocalState
    }
    return { timeStampMsec: 0 }
  },
  localStateDates: (state) => {
    return state.localStateDates
  },
  stateChanged: (state) => {
    return state.stateChanged
  },
  stateDateCurrent: (state) => {
    if (state.timeStampMsec) {
      return toLocaleDateTimeString(state.timeStampMsec)
    }
    return ''
  },
  timeStampMsec: (state) => {
    return state.timeStampMsec
  }
}

/**
 * Naming convention:
 *
 * CRUD:
 * - create
 * - delete
 */
const actions = {
  checkApi ({ commit }) {
    return httpRequest.request({ method: 'get', url: 'version' }).then((response) => {
      commit('setApiVersion', response.data.version)
    }).catch(() => {
      commit('setApiVersion', null)
    })
  },
  deleteFromExternalByTime ({ dispatch }, timeStampMsec) {
    return httpRequest.request({ method: 'delete', url: `by-time/${timeStampMsec}` }).then(() => {
      dispatch('fetchExternalStateDates')
    }).catch(() => true)
  },
  deleteFromLocalByTime ({ dispatch }, timeStampMsec) {
    localStorage.removeItem(`state_${timeStampMsec}`)
    dispatch('fetchLocalStateDates')
  },
  fetchExternalStateDates ({ commit }) {
    return httpRequest.request({ method: 'get', url: '' }).then((response) => {
      const dates = response.data.sort().reverse()
      commit('fetchExternalStateDates', dates)
    }).catch(() => true)
  },
  fetchLocalStateDates ({ commit }) {
    const dates = []
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      const key = localStorage.key(i)
      const match = key.match(/state_(\d+)/)
      if (match) {
        dates.push(match[1])
      }
    }
    dates.sort().reverse()
    commit('fetchLocalStateDates', dates)
  },
  importFromExternalByTime ({ dispatch }, timeStampMsec) {
    return httpRequest.request({ method: 'get', url: `by-time/${timeStampMsec}` }).then((response) => {
      dispatch('importState', response.data)
    }).catch(() => true)
  },
  importFromLocalByTime ({ dispatch }, timeStampMsec) {
    const state = localStorage.getItem(`state_${timeStampMsec}`)
    dispatch('importState', state)
  },
  importFromSpreadsheet: ({ dispatch }, importString) => {
    const lines = importString.split('\n')
    for (const line of lines) {
      const match = line.match(/(.*)\t(.*)\t([^]*)/)
      if (match && match[1] !== 'Familienname' && match[1] !== 'Insgesamt:') {
        const lastName = match[1]
        const firstName = match[2]
        const grade = match[3]
        console.log(`Import: first name: ${firstName} last name: ${lastName} grade: ${grade}`)
        dispatch('createPerson', { firstName, lastName, grade })
      }
    }
  },
  importLatestExternalState ({ commit }) {
    return httpRequest.request({ method: 'get', url: 'latest' }).then((response) => {
      commit('importLatestExternalState', response.data)
    }).catch(() => true)
  },
  importLatestLocalState ({ commit }) {
    const timeStampMsec = localStorage.getItem('latest')
    if (timeStampMsec) {
      const localState = localStorage.getItem(`state_${timeStampMsec}`)
      if (localState) {
        commit('importLatestLocalState', JSON.parse(localState))
      }
    }
  },
  async importLatestState ({ dispatch, getters }) {
    await dispatch('importLatestExternalState')
    dispatch('importLatestLocalState')
    const external = getters.latestExternalState
    const local = getters.latestLocalState
    if (external.timeStampMsec === local.timeStampMsec === 0) {
      // Do nothing
    } else if (external.timeStampMsec >= local.timeStampMsec) {
      dispatch('importState', external)
    } else if (local.timeStampMsec >= external.timeStampMsec) {
      dispatch('importState', local)
    }
  },
  importState: ({ commit, dispatch }, jsonObject) => {
    let newState
    if (typeof jsonObject === 'string') {
      newState = JSON.parse(jsonObject)
    } else {
      newState = jsonObject
    }
    if ({}.hasOwnProperty.call(newState, 'grades')) {
      dispatch('importGradesState', newState.grades)
    }
    if ({}.hasOwnProperty.call(newState, 'jobs')) {
      dispatch('importJobsState', newState.jobs)
    }
    if ({}.hasOwnProperty.call(newState, 'meta')) {
      dispatch('importMetaState', newState.meta)
    }
    commit('setTimeStampMsec', newState.timeStampMsec)
    commit('flushAppState')
    commit('setImportInProgress', false)
  },
  save ({ dispatch, commit, getters }) {
    if (getters.stateChanged) {
      commit('setTimeStampMsec')
      dispatch('saveToLocalStorage')
      dispatch('saveToExternalStorage')
    }
  },
  saveToExternalStorage ({ getters }) {
    return httpRequest.request({ method: 'post', url: '', data: getters.exportStateObject }).catch(() => true)
  },
  saveToLocalStorage: ({ commit, getters }) => {
    const state = getters.exportStateObject
    const stateString = JSON.stringify(state)
    localStorage.setItem('latest', state.timeStampMsec)
    localStorage.setItem(`state_${state.timeStampMsec}`, stateString)
    commit('setStateChanged', false)
  }
}

/**
 * Naming convention:
 *
 * CRUD:
 * - create
 * - delete
 */
const mutations = {
  fetchExternalStateDates: (state, dates) => {
    state.externalStateDates = dates
  },
  fetchLocalStateDates: (state, dates) => {
    state.localStateDates = dates
  },
  importLatestExternalState: (state, importedState) => {
    state.latestExternalState = importedState
  },
  importLatestLocalState: (state, importedState) => {
    state.latestLocalState = importedState
  },
  setApiVersion: (state, version) => {
    state.apiVersion = version
  },
  setImportInProgress: (state, status) => {
    state.importInProgress = status
  },
  setStateChanged: (state, status) => {
    state.stateChanged = status
  },
  setTimeStampMsec: (state, timeStampMsec = null) => {
    if (!timeStampMsec) {
      state.timeStampMsec = new Date().getTime()
    } else {
      state.timeStampMsec = timeStampMsec
    }
  }
}

export default {
  InitState,
  state,
  getters,
  actions,
  mutations
}