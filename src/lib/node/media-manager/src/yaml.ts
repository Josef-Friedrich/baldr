import fs from 'fs'

import type { AssetType, StringIndexedObject } from '@bldr/type-definitions'
import { readFile, writeFile } from '@bldr/core-node'
import { convertToYaml, convertFromYaml } from '@bldr/yaml'

import { asciify, deasciify } from '@bldr/core-browser'
import { Asset } from './media-file-classes'
import { categoriesManagement } from '@bldr/media-categories'

/**
 * Load a YAML file and convert it into a Javascript object. The string
 * properties are converted into the `camleCase` format.
 *
 * @param filePath - The path of a YAML file itself.
 *
 * @returns The parsed YAML file as an object. The string properties are
 * converted into the `camleCase` format.
 */
export function readYamlFile (filePath: string): StringIndexedObject {
  return convertFromYaml(readFile(filePath))
}

/**
 * Load the metadata file in the YAML format of a media asset. This
 * function appends `.yml` on the file path. It is a small wrapper
 * around `readYamlFile`.
 *
 * @param filePath - The path of a media asset without the `yml`
 * extension. For example `Fuer-Elise.mp3` not `Fuer-Elise.mp3.yml`.
 *
 * @returns The parsed YAML file as an object. The string properties are
 * converted in the `camleCase` format.
 */
export function readYamlMetaData (filePath: string): StringIndexedObject {
  return readYamlFile(`${filePath}.yml`)
}

/**
 * Convert some data (usually Javascript objets) into the YAML format
 * and write the string into a text file. The property names are
 * converted to `snake_case`.
 *
 * @param filePath - The file path of the destination yaml file. The yml
 *   extension has to be included.
 * @param data - Some data to convert into yaml and write into a text
 *   file.
 *
 * @returns The data converted to YAML as a string.
 */
export function writeYamlFile (filePath: string, data: object): string {
  const yaml = convertToYaml(data)
  writeFile(filePath, yaml)
  return yaml
}

/**
 * Write the metadata YAML file for a corresponding media file specified
 * by `filePath`. The property names are converted to `snake_case`.
 *
 * @param filePath - The filePath gets asciified and a yml extension is
 *   appended.
 * @param metaData - The metadata to store in the YAML file.
 * @param force - Always create the yaml file. Overwrite the old one.
 */
export function writeYamlMetaData (filePath: string, metaData?: AssetType.YamlFormat, force?: boolean): object | undefined {
  if (fs.lstatSync(filePath).isDirectory()) return
  const yamlFile = `${asciify(filePath)}.yml`
  if (
    (force != null && force) ||
    !fs.existsSync(yamlFile)
  ) {
    // eslint-disable-next-line
    if (metaData == null) metaData = {} as AssetType.YamlFormat
    const asset = new Asset(filePath)
    if (metaData.ref == null) {
      metaData.ref = asset.basename
    }
    if (metaData.title == null) {
      metaData.title = deasciify(asset.basename)
    }

    metaData.filePath = filePath
    metaData = categoriesManagement.process(metaData as AssetType.YamlFormat)
    writeYamlFile(yamlFile, metaData)
    return {
      filePath,
      yamlFile,
      metaData
    }
  }
  return {
    filePath,
    msg: 'No action.'
  }
}
