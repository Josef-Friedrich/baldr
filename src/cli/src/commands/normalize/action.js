// Node packages.
const fs = require('fs')

// Third party packages.
const yaml = require('js-yaml')

// Project packages.
const mediaServer = require('@bldr/api-media-server')

const lib = require('../../lib.js')

/**
 * @param {String} filePath - The media asset file path.
 */
function normalizeOneFile (filePath) {
  const yamlFile = `${filePath}.yml`
  const metaData = yaml.safeLoad(lib.readFile(yamlFile))
  console.log(mediaServer.metadataTypes.process(metaData, 'person'))
  lib.writeYamlFile(yamlFile, lib.normalizeMetaData(filePath, metaData))
}

/**
 * @param {Array} files - An array of input files, comes from the commanders’
 *   variadic parameter `[files...]`.
 */
function action (files) {
  mediaServer.walk({
    asset (relPath) {
      if (fs.existsSync(`${relPath}.yml`)) {
        normalizeOneFile(relPath)
      }
    }
  }, {
    path: files
  })
}

module.exports = action
