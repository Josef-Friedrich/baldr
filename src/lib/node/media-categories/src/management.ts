/**
 * Code to manage and process the meta data types of the media server.
 *
 * A media asset can be attached to multiple meta data types (for example:
 * `meta_types: recording,composition`). All meta data types belong to the type
 * `general`. The media category `general` is applied at the end.
 *
 * The meta data types are specified in the module
 * {@link module:@bldr/media-server/meta-type-specs meta-type-specs}
 *
 * @module @bldr/media-manager/meta-types
 */

// Node packages.
import path from 'path'

// Project packages.
import { deepCopy, getExtension } from '@bldr/core-browser'
import { convertPropertiesSnakeToCamel } from '@bldr/yaml'
import config from '@bldr/config'
import type { MediaCategory, AssetType, DeepTitleInterface } from '@bldr/type-definitions'

import { DeepTitle } from '@bldr/titles'
import { categories } from './specs'
import { checkTypeAbbreviations } from './two-letter-abbreviations'

checkTypeAbbreviations(categories)

/**
 * Check a file path against a regular expression to get the category name.
 *
 * @returns The category names for example `person,group,general`
 */
export function detectCategoryByPath (filePath: string): MediaCategory.Names | undefined {
  filePath = path.resolve(filePath)
  const names = new Set()
  for (const name in categories) {
    const category = categories[name as MediaCategory.Name]
    if (category.detectCategoryByPath != null) {
      let regexp
      if (typeof category.detectCategoryByPath === 'function') {
        regexp = category.detectCategoryByPath(category)
      } else {
        regexp = category.detectCategoryByPath
      }
      if (filePath.match(regexp) != null) names.add(name)
    }
  }
  names.add('general')
  if (names.size > 0) return [...names].join(',')
}

/**
 * Generate the file path of the first specifed media category.
 *
 * @param data - The mandatory property is “categories” and “extension”.
 *   One can omit the property “extension”, but than you have to specify
 *   the property “mainImage”.
 * @param oldPath - The old file path.
 *
 * @returns A absolute path
 */
export function formatFilePath (data: AssetType.YamlFormat, oldPath?: string): string | undefined {
  if (data.categories == null) throw new Error('Your data needs a property named “categories”.')
  // TODO: support multiple types
  // person,general -> person
  const categoryName = data.categories.replace(/,.*$/, '') as MediaCategory.Name
  const category = categories[categoryName]
  if (category == null) throw new Error(`Unkown media category “${categoryName}”.`)

  if (category.relPath == null || typeof category.relPath !== 'function') {
    return
  }

  // The relPath function needs this.extension.
  if (data.extension == null) {
    if (data.mainImage == null) {
      throw new Error('Your data needs a property named “mainImage”.')
    }
    const extension = getExtension(data.mainImage)
    if (extension == null) {
      throw new Error('Extension couldn’t be detected.')
    }
    data.extension = extension
    // b/Bush_George-Walker/main.jpeg
  }
  if (data.extension === 'jpeg') data.extension = 'jpg'
  let oldRelPath = ''
  if (oldPath != null) {
    oldRelPath = path.resolve(oldPath)
    oldRelPath = oldRelPath.replace(config.mediaServer.basePath, '')
    oldRelPath = oldRelPath.replace(/^\//, '')
  }

  // b/Bush_George-Walker/main.jpeg
  const relPath = category.relPath({ data, category, oldRelPath })
  if (relPath == null) {
    throw new Error(`The relPath() function has to return a string for media category “${categoryName}”`)
  }
  const basePath = category.basePath != null ? category.basePath : config.mediaServer.basePath
  return path.join(basePath, relPath)
}

/**
 * Check if the given argument is has value and is no empty string.
 */
function isValue (value: string | boolean | number): boolean {
  if (!['string', 'boolean', 'number'].includes(typeof value)) {
    return false
  }

  if (value === '') {
    return false
  }

  return true
}

/**
 * Apply the media category specifications to all props.
 *
 * @param data - An object containing some meta data.
 * @param func - A function with the arguments `spec` (property
 *   specification), `value`, `propName`
 * @param category - The specification of one media category.
 * @param replaceValues - Replace the values in the metadata object.
 */
function applySpecToProps (data: AssetType.YamlFormat, func: Function, category: MediaCategory.Category, replaceValues: boolean = true): AssetType.YamlFormat | AssetType.YamlFormat {
  function applyOneTypeSpec (props: MediaCategory.PropCollection, propName: string, data: AssetType.YamlFormat, func: Function, replaceValues: boolean): void {
    const propSpec = props[propName]
    const value = func(propSpec, data[propName], propName)
    if (replaceValues && isValue(value)) {
      data[propName] = value
    }
  }
  const propSpecs = category.props
  for (const propName in propSpecs) {
    applyOneTypeSpec(propSpecs, propName, data, func, replaceValues)
  }
  return data
}

/**
 * @param propSpec - The
 *   specification of one property
 */
function isPropertyDerived (propSpec: MediaCategory.Prop): boolean {
  if (typeof propSpec.derive === 'function') {
    return true
  }
  return false
}

/**
 * Sort the given object according the type specification. Not specifed
 * propertiers are attached on the end of the object. Fill the object
 * with derived values.
 *
 * @param data - An object containing some meta data.
 * @param category - The specification of one media category.
 * @param filePath - The path of media asset itself, not the metadata
 *   `*.extension.yml` file.
 */
function sortAndDeriveProps (data: AssetType.YamlFormat, category: MediaCategory.Category, filePath?: string): AssetType.YamlFormat {
  const origData = deepCopy(data) as AssetType.YamlFormat
  // eslint-disable-next-line
  const result: AssetType.YamlFormat = {} as AssetType.YamlFormat

  let folderTitles: DeepTitleInterface | undefined
  if (filePath != null) {
    folderTitles = new DeepTitle(filePath) as DeepTitleInterface
  }

  // Loop over the propSpecs to get a sorted object
  const propSpecs = category.props
  for (const propName in propSpecs) {
    const propSpec = propSpecs[propName]
    const origValue = origData[propName]

    let derivedValue
    if (isPropertyDerived(propSpec) && (propSpec.derive != null)) {
      derivedValue = propSpec.derive({ data, category, folderTitles, filePath })
    }

    // Use the derived value
    const overwriteByDerived: boolean = propSpec.overwriteByDerived != null ? propSpec.overwriteByDerived : false
    if (
      isValue(derivedValue) &&
      (
        (!overwriteByDerived && !isValue(origValue)) || overwriteByDerived
      )
    ) {
      result[propName] = derivedValue
    // Use orig value
    } else if (isValue(origValue)) {
      result[propName] = origValue
    }
    // Throw away the value of this property. We prefer the derived
    // version.
    // eslint-disable-next-line
    delete origData[propName]
  }

  // Add additional properties not in the propSpecs.
  for (const propName in origData) {
    const value = origData[propName]
    if (isValue(value)) {
      result[propName] = value
    }
  }

  return result
}

/**
 * @param data - An object containing some meta data.
 * @param category - The category name.
 */
function formatProps (data: AssetType.YamlFormat, category: MediaCategory.Category, filePath?: string): AssetType.YamlFormat {
  function formatOneProp (spec: MediaCategory.Prop, value: any): any {
    if (
      isValue(value) &&
      (spec.format != null) &&
      typeof spec.format === 'function'
    ) {
      return spec.format(value, { data, category, filePath })
    }
    return value
  }
  return applySpecToProps(data, formatOneProp, category)
}

/**
 * @param data - An object containing some meta data.
 * @param category - The specification of one media category.
 */
function validateProps (data: AssetType.YamlFormat, category: MediaCategory.Category): void {
  function validateOneProp (spec: MediaCategory.Prop, value: any, prop: MediaCategory.PropName): void {
    // required
    if (spec.required != null && !isValue(value)) {
      throw new Error(`Missing property ${prop}`)
    }
    // validate
    if (spec.validate != null && typeof spec.validate === 'function' && isValue(value)) {
      const result = spec.validate(value)
      if (!result) {
        // eslint-disable-next-line
        throw new Error(`Validation failed for property “${prop}” and value “${value}”`)
      }
    }
  }
  applySpecToProps(data, validateOneProp, category, false)
}

/**
 * Delete properties from the data.
 *
 * @param data - An object containing some meta data.
 * @param category - The specification of one media category.
 */
function removeProps (data: AssetType.YamlFormat, category: MediaCategory.Category): AssetType.YamlFormat {
  for (const propName in category.props) {
    if (data[propName] != null) {
      const value = data[propName]
      const propSpec = category.props[propName]
      if (
        // eslint-disable-next-line
        !isValue(value) ||
        // eslint-disable-next-line
        (propSpec.state && propSpec.state === 'absent') ||
        (
          (propSpec.removeByRegexp != null) &&
          propSpec.removeByRegexp instanceof RegExp &&
          typeof value === 'string' &&
          (value.match(propSpec.removeByRegexp) != null)
        )
      ) {
        // eslint-disable-next-line
        delete data[propName]
      }
    }
  }
  return data
}

/**
 * Bundle three operations: Sort and derive, format, validate.
 *
 * @param data - An object containing some meta data.
 * @param name - The name of the media category, for example “general” or “cloze”.
 * @param filePath - The path of media asset itself, not the metadata
 *   `*.extension.yml` file.
 */
function processByType (data: AssetType.YamlFormat, name: MediaCategory.Name, filePath?: string): AssetType.YamlFormat {
  if (categories[name] == null) {
    throw new Error(`Unkown meta category name: “${name}”`)
  }
  const category = categories[name]

  if ((category.initialize != null) && typeof category.initialize === 'function') {
    data = category.initialize({ data, category, filePath })
  }
  data = sortAndDeriveProps(data, category, filePath)
  data = formatProps(data, category, filePath)
  // We need filePath in format. Must be after formatProps
  data = removeProps(data, category)

  validateProps(data, category)

  if ((category.finalize != null) && typeof category.finalize === 'function') {
    data = category.finalize({ data, category, filePath })
  }
  return data
}

/**
 * Merge category names to avoid duplicate metadata category names:
 */
export function mergeNames (...name: string[]): string {
  const categories = new Set()
  for (let i = 0; i < arguments.length; i++) {
    const categoryNames = arguments[i]
    if (typeof categoryNames === 'string' && categoryNames !== '') {
      for (const name of categoryNames.split(',')) {
        categories.add(name)
      }
    }
  }
  return [...categories].join(',')
}

/**
 * Bundle three operations: Sort and derive, format, validate.
 *
 * @param data - An object containing some meta data.
 * @param filePath - The path of media asset itself, not the metadata
 *   `*.extension.yml` file.
 */
export function process (data: AssetType.YamlFormat, filePath?: string): AssetType.YamlFormat {
  // The media category specification is in camel case. The meta data is
  // stored in the YAML format in snake case
  data = convertPropertiesSnakeToCamel(data) as AssetType.YamlFormat
  if (data.categories == null) {
    data.categories = 'general'
  } else if (!data.categories.includes('general')) {
    data.categories = `${data.categories},general`
  }
  if (data.categories != null) {
    for (const name of data.categories.split(',')) {
      data = processByType(data, name as MediaCategory.Name, filePath)
    }
  }
  const result = data
  // Do not convert back. This conversion should be the last step, before
  // object is converted to YAML.
  // convertProperties(data, 'camel-to-snake')
  return result
}
