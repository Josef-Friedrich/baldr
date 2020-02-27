/**
 * Low level classes and functions used by the node packages. Some helper
 * functions etc.
 *
 * @module @bldr/core-node
 */

// Node packages.
const fs = require('fs')
const path = require('path')
const util = require('util')
const childProcess = require('child_process')

// Third party packages
const git = require('git-rev-sync')

/**
 * Wrapper around `util.format()` and `console.log()`
 */
function log (format) {
  const args = Array.from(arguments).slice(1)
  console.log(util.format(format, ...args))
}

/**
 * By default this module reads the configuration file `/etc/baldr.json` to
 * generate its configuration object.
 *
 * @param {object} configDefault - Default options which gets merged.
 *
 * @return {object}
 */
function bootstrapConfig (configDefault) {
  const configFile = path.join(path.sep, 'etc', 'baldr.json')

  let configJson
  if (fs.existsSync(configFile)) {
    configJson = require(configFile)
  }

  if (!configJson) throw new Error(`No configuration file found: ${configFile}`)

  if (configDefault) {
    return Object.assign(configDefault, configJson)
  }
  return configJson
}

/**
 * Generate a revision string in the form version-gitshort(-dirty)
 */
function gitHead () {
  return {
    short: git.short(),
    long: git.long(),
    isDirty: git.isDirty()
  }
}

/**
 * Check if some executables are installed. Throws an error if not.
 *
 * @param {Array|String} executables - An array of executables names or a
 *   a single executable as a string.
 */
function checkExecutables (executables) {
  if (!Array.isArray(executables)) executables = [executables]
  for (const executable of executables) {
    const process = childProcess.spawnSync('which', [executable], { shell: true })
    if (process.status !== 0) {
      throw new Error(`Executable is not available: ${executable}`)
    }
  }
}

module.exports = {
  bootstrapConfig,
  gitHead,
  log,
  checkExecutables
}
