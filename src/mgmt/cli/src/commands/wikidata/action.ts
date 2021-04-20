// Node packages.
import fs from 'fs'
import path from 'path'

// Third party packages.
import chalk from 'chalk'
import wikidata from '@bldr/wikidata'

// Project packages.
import { writeYamlFile } from '@bldr/media-manager'
import { categoriesManagement } from '@bldr/media-categories'
import type { AssetType } from '@bldr/type-definitions'
import config from '@bldr/config'

/**
 * @param category - For example `group`, `instrument`, `person`,
 *   `song`
 * @param itemId - For example `Q123`
 */
async function action (category: string, itemId: string, arg1: string, arg2: string, cmdObj: { [key: string]: any }): Promise<void> {
  let rawData = await wikidata.query(itemId, category, categoriesManagement.categories)
  if (arg1) {
    if (category === 'person') {
      rawData.firstname = arg1
      rawData.lastname = arg2
    }
  }
  rawData.categories = category
  const data = <AssetType.FileFormat> categoriesManagement.process(rawData)
  console.log(data)

  let downloadWikicommons = true
  if (!rawData.mainImage) {
    data.mainImage = 'blank.jpg'
    downloadWikicommons = false
  }

  const dest = categoriesManagement.formatFilePath(data)
  if (downloadWikicommons) {
    if (!cmdObj.dryRun && data.mainImage) {
      await wikidata.fetchCommonsFile(data.mainImage, dest)
    } else {
      console.log(`Dry run! Destination: ${chalk.green(dest)}`)
    }
  }

  if (!cmdObj.dryRun && !fs.existsSync(dest)) {
    const src = path.join(config.localRepo, 'src', 'mgmt', 'cli', 'src', 'blank.jpg')
    console.log(src)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    console.log(`No Wikicommons file. Use temporary blank file instead.`)
  }

  const yamlFile = `${dest}.yml`
  if (!fs.existsSync(yamlFile)) {
    if (!cmdObj.dryRun) {
      console.log(`Write YAML file: ${chalk.green(yamlFile)}`)
      writeYamlFile(yamlFile, data)
    }
  } else {
    console.log(`The YAML file already exists: ${chalk.red(yamlFile)}`)
  }
}

export = action