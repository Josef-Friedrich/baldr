#! /usr/bin/env node

// Node packages.
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

// Third party packages.
const commander = require('commander')
const chalk = require('chalk')
const yaml = require('js-yaml')
const musicMetadata = require('music-metadata')

// Project packages
const {
  asciify,
  Asset,
  assetTypes,
  deasciify,
  FolderTitleTree,
  getExtension,
  HierarchicalFolderTitles,
  walk
} = require('./main.js')
const { bootstrapConfig } = require('@bldr/core-node')

// Project packages.
const config = bootstrapConfig()

/*******************************************************************************
 * Common functions
 ******************************************************************************/

function makeAsset (mediaFile) {
  return new Asset(mediaFile).addFileInfos()
}

function filePathToAssetType (filePath) {
  const asset = makeAsset(filePath)
  const inputExtension = asset.extension.toLowerCase()
  return assetTypes.extensionToType(inputExtension)
}

/**
 * Sort the keys and clean up some entires.
 *
 * @param {String} filePath - The media asset file path.
 * @param {Object} metaData - The object representation of the yaml meta data
 *   file.
 */
function normalizeMetaData (filePath, metaData) {
  const normalized = {}

  // a-Strawinsky-Petruschka-Abschnitt-0_22
  if (metaData.id) metaData.id = metaData.id.replace(/^[va]-/, '')
  // a Strawinsky Petruschka Abschnitt 0_22
  if (metaData.title) metaData.title = metaData.title.replace(/^[va] /, '')

  for (const key of ['id', 'title', 'description', 'composer']) {
    if (key in metaData) {
      normalized[key] = metaData[key]
      delete metaData[key]
    }
  }

  // HB_Ausstellung_Gnome -> Ausstellung_HB_Gnome
  normalized.id = normalized.id.replace(/^([A-Z]{2,})_([a-zA-Z0-9-]+)_/, '$2_$1_')

  function generateIdPrefix (filePath) {
    const pathSegments = filePath.split('/')
    // HB
    const parentDir = pathSegments[pathSegments.length - 2]
    if (parentDir.length !== 2 || !parentDir.match(/[A-Z]{2,}/)) {
      return
    }
    const assetTypeAbbreviation = parentDir
    // 20_Strawinsky-Petruschka
    const subParentDir = pathSegments[pathSegments.length - 3]
    // Strawinsky-Petruschka
    const presentationId = subParentDir.replace(/^[0-9]{2,}_/, '')
    // Strawinsky-Petruschka_HB
    const idPrefix = `${presentationId}_${assetTypeAbbreviation}`
    return idPrefix
  }
  const idPrefix = generateIdPrefix(filePath)
  if (idPrefix && normalized.id.indexOf(idPrefix) === -1) {
    normalized.id = `${idPrefix}_${normalized.id}`
  }

  for (const key in metaData) {
    if (metaData.hasOwnProperty(key)) {
      normalized[key] = metaData[key]
      delete metaData[key]
    }
  }

  // title: 'Tonart CD 4: Spur 29'
  if ('title' in normalized && normalized.title.match(/.+CD.+Spur/)) {
    delete normalized.title
  }

  // composer: Helbling-Verlag
  if ('composer' in normalized && normalized.composer.indexOf('Verlag') > -1) {
    delete normalized.composer
  }

  return normalized
}

/**
 * Create and write the meta data YAML to the disk.
 *
 * @param {String} filePath - The file path of the destination yaml file. The yml
 *   extension has to be included.
 * @param {Object} metaData - The object to convert into yaml and write to
 *   the disk.
 */
function writeMetaDataYamlFile (filePath, metaData) {
  const yamlMarkup = [
    '---',
    yaml.safeDump(metaData)
  ]
  const result = yamlMarkup.join('\n')
  console.log(result)
  fs.writeFileSync(filePath, result)
}

/**
 * Write the metadata YAML file.
 *
 * @param {String} inputFile
 * @param {Object} metaData
 */
function writeMetaDataYaml (filePath, metaData) {
  const yamlFile = `${asciify(filePath)}.yml`
  if (!fs.lstatSync(filePath).isDirectory() && !fs.existsSync(yamlFile)) {
    if (!metaData) metaData = {}
    const asset = new Asset(filePath).addFileInfos()
    if (!metaData.id) {
      metaData.id = asset.basename_
    }
    if (!metaData.title) {
      metaData.title = deasciify(asset.basename_)
    }
    writeMetaDataYamlFile(yamlFile, normalizeMetaData(filePath, metaData))
  }
}

/**
 * Rename a media asset and it’s corresponding meta data file (`*.yml`)
 *
 * @param {String} oldPath - The old path of a media asset.
 * @param {String} newPath - The new path of a media asset.
 */
function renameAsset (oldPath, newPath) {
  const oldRelPath = oldPath.replace(process.cwd(), '')
  console.log(`old: ${chalk.yellow(oldRelPath)}`)
  if (newPath && oldPath !== newPath) {
    const newRelPath = newPath.replace(process.cwd(), '')
    console.log(`new: ${chalk.green(newRelPath)}`)
    if (fs.existsSync(`${oldPath}.yml`)) {
      fs.renameSync(`${oldPath}.yml`, `${newPath}.yml`)
      console.log(`new: ${chalk.cyan(newRelPath + '.yml')}`)
    }
    fs.renameSync(oldPath, newPath)
    return newPath
  }
}

/*******************************************************************************
 * Subcommands
 ******************************************************************************/

/** a / audacity **************************************************************/

function actionAudacity (filePath) {
  const text = fs.readFileSync(filePath, { encoding: 'utf-8' })
  console.log(text)

  const lines = text.split('\n')
  const samples = []
  for (const line of lines) {
    const match = line.match(/([\d\.]+)\t([\d\.]+)\t(.+)/) // eslint-disable-line
    if (match) {
      const startTime = Number(match[1])
      let endTime = Number(match[2])
      const title = match[3]
      const id = title.toLowerCase()

      if (startTime === endTime) {
        endTime = null
      }
      const sample = {
        id,
        title,
        start_time: startTime
      }
      if (endTime) sample['end_time'] = endTime
      samples.push(sample)
    }
  }
  for (const index in samples) {
    const sample = samples[index]
    if (!sample.end_time && index < samples.length - 1) {
      sample['end_time'] = samples[parseInt(index) + 1]['start_time']
    }
  }
  console.log(yaml.safeDump(samples))
}

commander
  .command('audacity <input>').alias('a')
  .description('Convert audacity text mark file into a yaml file.')
  .action(actionAudacity)

/** c / convert ***************************************************************/

/**
 * Output from `music-metadata`:
 *
 * ```js
 * {
 *   format: {
 *     tagTypes: [ 'ID3v2.3', 'ID3v1' ],
 *     lossless: false,
 *     container: 'MPEG',
 *     codec: 'MP3',
 *     sampleRate: 44100,
 *     numberOfChannels: 2,
 *     bitrate: 192000,
 *     codecProfile: 'CBR',
 *     numberOfSamples: 18365184,
 *     duration: 416.4440816326531
 *   },
 *   native: undefined,
 *   quality: { warnings: [] },
 *   common: {
 *     track: { no: 2, of: 7 },
 *     disk: { no: 1, of: 1 },
 *     title: 'Symphonie fantastique, Op. 14: II. Un bal',
 *     artists: [ 'Hector Berlioz' ],
 *     artist: 'Hector Berlioz',
 *     album: 'Symphonie fantastique / Lélio',
 *     media: 'CD',
 *     originalyear: 1998,
 *     year: 1998,
 *     label: [ 'BMG Classics' ],
 *     artistsort: 'Berlioz, Hector',
 *     asin: 'B000006OPB',
 *     barcode: '090266893027',
 *     musicbrainz_recordingid: 'ca3b02af-b6be-4f95-8217-31126b2c2b67',
 *     catalognumber: [ '09026-68930-2' ],
 *     releasetype: [ 'album' ],
 *     releasecountry: 'US',
 *     acoustid_id: 'ed58118e-3b76-492b-9453-223d0ca72b86',
 *     musicbrainz_albumid: '986209e3-ce80-4b66-af78-22a035dde993',
 *     musicbrainz_artistid: [ '274774a7-1cde-486a-bc3d-375ec54d552d' ],
 *     albumartist: 'Berlioz; San Francisco Symphony & Chorus, Michael Tilson Thomas',
 *     musicbrainz_releasegroupid: '3a7e05b9-14fd-3cff-ac29-e568dd10a2a9',
 *     musicbrainz_trackid: 'c90eaa1c-2be5-4eba-a37e-fa3d1dfb0882',
 *     albumartistsort: 'Berlioz, Hector; San Francisco Symphony & San Francisco Symphony Chorus, Tilson Thomas, Michael',
 *     musicbrainz_albumartistid: [
 *       '274774a7-1cde-486a-bc3d-375ec54d552d',
 *       'deebc49a-6e06-418e-860f-8c7f770a8bac',
 *       '568d7c51-0573-4c65-9211-65bf8c8470c7',
 *       'f6df125a-a83c-4161-8cbe-48f4a3a7cad5'
 *     ],
 *     picture: [ [Object] ]
 *   }
 * }
 * ```
 *
 * @param {String} inputFile
 *
 * @returns {object}
 */
async function collectMusicMetaData (inputFile) {
  const metaData = await musicMetadata.parseFile(inputFile)

  if ('common' in metaData) {
    const output = {}
    const common = metaData.common
    for (const property of [
      ['title', 'title'],
      ['albumartist', 'artist'],
      ['artist', 'composer'],
      ['album', 'album'],
      ['musicbrainz_recordingid', 'musicbrainz_recording_id']
    ]) {
      if (property[0] in common && common[property[0]]) {
        output[property[1]] = common[property[0]]
      }
    }
    if (output.album && output.title) {
      output.title = `${output.album}: ${output.title}`
      delete output.album
    }
    return output
  }
}

/**
 * Convert one input file.
 *
 * @param {String} inputFile - Path of the input file.
 * @param {Object} cmdObj - The command object from the commander.
 */
async function convertOneFile (inputFile, cmdObj) {
  const asset = makeAsset(inputFile)
  console.log(asset)

  const inputExtension = asset.extension.toLowerCase()
  let assetType
  try {
    assetType = assetTypes.extensionToType(inputExtension)
  } catch (error) {
    console.log(`Unsupported extension ${inputExtension}`)
    return
  }
  const outputExtension = assetTypes.typeToTargetExtension(assetType)
  let outputFile = `${asciify(asset.basename_)}.${outputExtension}`

  let convert

  // audio
  // https://trac.ffmpeg.org/wiki/Encode/AAC

  // ffmpeg aac encoder
  // '-c:a', 'aac', '-b:a', '128k',

  // aac_he
  // '-c:a', 'libfdk_aac', '-profile:a', 'aac_he','-b:a', '64k',

  // aac_he_v2
  // '-c:a', 'libfdk_aac', '-profile:a', 'aac_he_v2'

  if (assetType === 'audio') {
    convert = childProcess.spawn('ffmpeg', [
      '-i', inputFile,
      // '-c:a', 'aac', '-b:a', '128k',
      // '-c:a', 'libfdk_aac', '-profile:a', 'aac_he', '-b:a', '64k',
      '-c:a', 'libfdk_aac', '-profile:a', 'aac_he_v2',
      '-vn', // Disable video recording
      '-map_metadata', '-1', // remove metadata
      '-y', // Overwrite output files without asking
      outputFile
    ])

  // image
  } else if (assetType === 'image') {
    let size = '2000x2000>'
    if (cmdObj.previewImage) {
      outputFile = inputFile.replace(`.${asset.extension}`, '_preview.jpg')
      size = '1000x1000>'
    }
    convert = childProcess.spawn('magick', [
      'convert',
      inputFile,
      '-resize', size, // http://www.imagemagick.org/Usage/resize/#shrink
      '-quality', '60', // https://imagemagick.org/script/command-line-options.php#quality
      outputFile
    ])

  // videos
  } else if (assetType === 'video') {
    convert = childProcess.spawn('ffmpeg', [
      '-i', inputFile,
      '-vcodec', 'libx264',
      '-profile:v', 'baseline',
      '-y', // Overwrite output files without asking
      outputFile
    ])
  }

  if (convert) {
    convert.stdout.on('data', (data) => {
      console.log(chalk.green(data))
    })

    convert.stderr.on('data', (data) => {
      console.log(chalk.red(data))
    })

    convert.on('close', async (code) => {
      if (assetType === 'audio') {
        const metaData = await collectMusicMetaData(inputFile)
        if (metaData) {
          writeMetaDataYaml(outputFile, metaData)
        }
      }
    })
  }
}

/**
 * Convert multiple files.
 *
 * @param {Array} inputFiles - An array of input files to convert.
 * @param {Object} cmdObj - The command object from the commander.
 */
function actionConvert (inputFiles, cmdObj) {
  if (inputFiles.length === 0) {
    walk(process.cwd(), {
      all (inputFile) {
        convertOneFile(inputFile, cmdObj)
      }
    })
  } else {
    for (const inputFile of inputFiles) {
      convertOneFile(inputFile, cmdObj)
    }
  }
}

commander
  .command('convert [input...]').alias('c')
  .option('-p, --preview-image', 'Convert into preview images (Smaller and different file name)')
  .description('Convert media files in the appropriate format. Multiple files, globbing works *.mp3')
  .action(actionConvert)

/** -h / --help ***************************************************************/

function actionHelp () {
  console.log('Specify a subcommand.')
  commander.outputHelp()
  process.exit(1)
}

/** i / id-to-filename ********************************************************/

/**
 * Rename a media asset after the `id` in the meta data file.
 *
 * @param {String} filePath - The media asset file path.
 */
function renameFromIdOneFile (filePath) {
  const result = yaml.safeLoad(fs.readFileSync(`${filePath}.yml`, 'utf8'))
  if ('id' in result && result.id) {
    let id = result.id
    const oldPath = filePath

    // .mp4
    const extension = path.extname(oldPath)
    const oldBaseName = path.basename(oldPath, extension)
    let newPath = null
    // Gregorianik_HB_Alleluia-Ostermesse -> Alleluia-Ostermesse
    id = id.replace(/.*_[A-Z]{2,}_/, '')
    console.log(id)
    if (id !== oldBaseName) {
      newPath = path.join(path.dirname(oldPath), `${id}${extension}`)
    } else {
      return
    }
    renameAsset(oldPath, newPath)
  }
}

/**
 * Rename a media asset or all child asset of the parent working directory
 * after the `id` in the meta data file.
 *
 * @param {String} filePath - The media file path.
 */
function actionIdToFilename (filePath) {
  if (filePath) {
    renameFromIdOneFile(filePath)
  } else {
    walk(process.cwd(), {
      asset (relPath) {
        if (fs.existsSync(`${relPath}.yml`)) {
          renameFromIdOneFile(relPath)
        }
      }
    })
  }
}

commander
  .command('id-to-filename [input]').alias('i')
  .description('Rename media assets after the id.')
  .action(actionIdToFilename)

/** m / mirror ****************************************************************/

/**
 * Create and open a relative path in different base paths.
 */
function actionMirror () {
  const basePaths = [
    '/var/data/baldr/media/',
    '/home/jf/schule-archiv/'
  ]

  const currentBasePaths = []
  for (const basePath of basePaths) {
    if (fs.existsSync(basePath)) {
      currentBasePaths.push(basePath)
    }
  }

  console.log(`This base paths exist or are accessible: ${chalk.yellow(currentBasePaths)}`)

  const cwd = process.cwd()

  const regex = /^[a-zA-Z0-9-_/]+$/g
  if (!regex.test(cwd)) {
    console.log(`The current working directory “${chalk.red(cwd)}” contains illegal characters.`)
    return
  }

  function getRelPath () {
    for (const basePath of currentBasePaths) {
      if (cwd.indexOf(basePath) === 0) {
        return cwd.replace(basePath, '')
      }
    }
  }

  const relPath = getRelPath()
  if (!relPath) {
    console.log(`Move to one of this base paths: ${chalk.red(basePaths)}`)
  } else {
    console.log(`Base path detected. The relative path is: ${chalk.yellow(relPath)}`)
  }

  for (const basePath of currentBasePaths) {
    const absPath = path.join(basePath, relPath)
    if (!fs.existsSync(absPath)) {
      console.log(`Create directory: ${chalk.yellow(absPath)}`)
      fs.mkdirSync(absPath, { recursive: true })
    }
    console.log(`Open directory: ${chalk.green(absPath)}`)
    const process = childProcess.spawn('xdg-open', [absPath], { detached: true })
    process.unref()
  }
}

commander
  .command('mirror').alias('m')
  .description('Create and open in the file explorer a relative path in different base paths.')
  .action(actionMirror)

/** n / normalize *************************************************************/

/**
 * @param {String} filePath - The media asset file path.
 */
function normalizeMetaDataYamlOneFile (filePath) {
  const yamlFile = `${filePath}.yml`
  const metaData = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'))
  writeMetaDataYamlFile(yamlFile, normalizeMetaData(filePath, metaData))
}

/**
 * @param {String} filePath - The media asset file path.
 */
function actionNormalize (filePath) {
  if (filePath) {
    normalizeMetaDataYamlOneFile(filePath)
  } else {
    walk(process.cwd(), {
      asset (relPath) {
        if (fs.existsSync(`${relPath}.yml`)) {
          normalizeMetaDataYamlOneFile(relPath)
        }
      }
    })
  }
}

commander
  .command('normalize [input]').alias('n')
  .description('Normalize the meta data files in the YAML format (Sort, clean up).')
  .action(actionNormalize)

/** o / open ******************************************************************/

/**
 * Open base path.
 */
function actionOpen () {
  const process = childProcess.spawn('xdg-open', [config.mediaServer.basePath], { detached: true })
  process.unref()
}

commander
  .command('open').alias('o')
  .description('Open the base directory in a file browser.')
  .action(actionOpen)

/** p / presentation-template *************************************************/

const presentationTemplate = `---
meta:
  title:
  subtitle:
  id:
  grade:
  curriculum:
  curriculum_url:

slides:

- generic: Hello world
`

/**
 * Create a presentation template named “Praesentation.baldr.yml”.
 */
function presentationFromTemplate (filePath) {
  fs.writeFileSync(filePath, presentationTemplate)
}

async function presentationFromAssets (filePath) {
  const slides = []
  await walk(process.cwd(), {
    asset (relPath) {
      const asset = makeAsset(relPath)
      slides.push(
        {
          [asset.assetType]: {
            src: `id:${asset.id}`
          }
        }
      )
    }
  })
  const yamlMarkup = [
    '---',
    yaml.safeDump({
      slides
    })
  ]
  const result = yamlMarkup.join('\n')
  console.log(result)
  fs.writeFileSync(filePath, result)
}

async function actionPresentationTemplate (command) {
  const filePath = path.join(process.cwd(), 'Praesentation.baldr.yml')
  if (!fs.existsSync(filePath) || command.force) {
    if (command.fromAssets) {
      await presentationFromAssets(filePath)
    } else {
      presentationFromTemplate(filePath)
    }
    console.log(`Presentation template created at: ${chalk.green(filePath)}`)
  } else {
    console.log(`Presentation already exists: ${chalk.red(filePath)}`)
  }
}

commander
  .command('presentation-template').alias('p')
  .option('-a, --from-assets', 'Create a presentation from the assets of the current working dir.')
  .option('-f, --force', 'Overwrite existing presentation.')
  .description('Create a presentation template named “Praesentation.baldr.yml”.')
  .action(actionPresentationTemplate)

/** r / rename ****************************************************************/

/**
 * @param {String} oldPath - The media file path.
 *
 * @returns {String}
 */
function renameOneFile (oldPath) {
  let newPath = asciify(oldPath)
  const basename = path.basename(newPath)
  // Remove a- and v- prefixes
  const cleanedBasename = basename.replace(/^[va]-/g, '')
  if (cleanedBasename !== basename) {
    newPath = path.join(path.dirname(newPath), cleanedBasename)
  }
  renameAsset(newPath, oldPath)
}

/**
 * Rename all child files in the current working directory.
 */
function actionRename () {
  walk(process.cwd(), {
    all (oldPath) {
      renameOneFile(oldPath)
    }
  })
}

commander
  .command('rename').alias('r')
  .description('Rename files, clean file names, remove all whitespaces and special characters.')
  .action(actionRename)

/** t / folder-title **********************************************************/

async function actionFolderTitles (filePath) {
  const tree = new FolderTitleTree()

  function read (filePath) {
    const titles = new HierarchicalFolderTitles(filePath)
    tree.add(titles)
    console.log(titles.all)
    console.log(`  id: ${chalk.cyan(titles.id)}`)
    console.log(`  title: ${chalk.yellow(titles.title)}`)
    if (titles.subtitle) console.log(`  subtitle: ${chalk.green(titles.subtitle)}`)
    console.log(`  curriculum: ${chalk.red(titles.curriculum)}`)
    console.log(`  grade: ${chalk.red(titles.grade)}`)
  }

  if (filePath) {
    read(filePath)
  } else {
    await walk(process.cwd(), {
      presentation (relPath) {
        read(relPath)
      }
    })
  }
  console.log(JSON.stringify(tree.tree_, null, 2))
}

commander
  .command('folder-title [input]').alias('t')
  .description('List all hierachical folder titles')
  .action(actionFolderTitles)

/** tt / title-tex ************************************************************/

/**
 * ```tex
 * \setzetitel{
 *   jahrgangsstufe = {6},
 *   ebenei = {Musik und ihre Grundlagen},
 *   ebeneii = {Systeme und Strukturen},
 *   ebeneiii = {die Tongeschlechter Dur und Moll},
 *   titel = {Dur- und Moll-Tonleiter},
 *   untertitel = {Das Lied \emph{„Kol dodi“} in Moll und Dur},
 * }
 * ```
 *
 * @param {String} filePath - The path of a TeX file.
 */
function patchTexFileWithTitles (filePath) {
  const titles = new HierarchicalFolderTitles(filePath)

  const setzeTitle = {
    jahrgangsstufe: titles.grade
  }

  const ebenen = ['ebenei', 'ebeneii', 'ebeneiii', 'ebeneiv', 'ebenev']
  for (let index = 0; index < titles.curriculumTitlesArray.length; index++) {
    setzeTitle[ebenen[index]] = titles.curriculumTitlesArray[index]
  }
  setzeTitle.titel = titles.title
  if (titles.subtitle) {
    setzeTitle.untertitel = titles.subtitle
  }

  const lines = ['\\setzetitel{']
  for (const key in setzeTitle) {
    lines.push(`  ${key} = {${setzeTitle[key]}},`)
  }
  lines.push('}')
  lines.push('') // to get a empty line

  let texFileString = fs.readFileSync(filePath, { encoding: 'utf-8' })
  texFileString = texFileString.replace(
    /\\setzetitel\{.+?,?\n\}\n/s, // /s s (dotall) modifier, +? one or more (non-greedy)
    lines.join('\n')
  )
  fs.writeFileSync(filePath, texFileString)
}

function actionTitleTex (filePath) {
  if (filePath) {
    patchTexFileWithTitles(filePath)
  } else {
    walk(process.cwd(), {
      everyFile (filePath) {
        const extension = getExtension(filePath)
        if (extension === 'tex') {
          patchTexFileWithTitles(filePath)
        }
      }
    })
  }
}

commander
  .command('title-tex [input]').alias('tt')
  .description('Replace title section of the TeX files with metadata retrieved from the title.txt files.')
  .action(actionTitleTex)

/** v / video-preview *********************************************************/

function createVideoPreviewImageOneFile (filePath, second) {
  const assetType = filePathToAssetType(filePath)
  if (assetType === 'video') {
    const output = `${filePath}_preview.jpg`
    const outputFileName = path.basename(output)
    console.log(`Preview image: ${chalk.green(outputFileName)} at second ${chalk.green(second)})`)
    childProcess.spawnSync('ffmpeg', [
      '-i', filePath,
      '-ss', second, // Position in seconds
      '-vframes', '1', // only handle one video frame
      '-qscale:v', '10', // Effective range for JPEG is 2-31 with 31 being the worst quality.
      '-y', // Overwrite output files without asking
      output
    ])
  }
}

function actionVideoPreview (filePath, second = 10) {
  if (filePath) {
    createVideoPreviewImageOneFile(filePath, second)
  } else {
    walk(process.cwd(), {
      asset (relPath) {
        createVideoPreviewImageOneFile(relPath, second)
      }
    })
  }
}

commander
  .command('video-preview [input] [second]').alias('v')
  .description('Create video preview images')
  .action(actionVideoPreview)

/** -v / --version ************************************************************/

commander
  .version(require('../package.json').version)

/** y / yaml ******************************************************************/

/**
 *
 */
function actionYaml (filePath) {
  if (filePath) {
    writeMetaDataYaml(filePath)
  } else {
    walk(process.cwd(), {
      asset (relPath) {
        writeMetaDataYaml(relPath)
      }
    })
  }
}

commander
  .command('yaml [input]').alias('y')
  .description('Create info files in the YAML format in the current working directory.')
  .action(actionYaml)

/** yv / yaml-validate ********************************************************/

/**
 * @param {String} filePath - The media file path.
 */
function validateYamlOneFile (filePath) {
  console.log(`Validate: ${chalk.yellow(filePath)}`)
  try {
    const result = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
    console.log(chalk.green('ok!'))
    console.log(result)
  } catch (error) {
    console.log(`${chalk.red(error.name)}: ${error.message}`)
  }
}

/**
 * @param {String} filePath - The media file path.
 */
function actionYamlValidate (filePath) {
  if (filePath) {
    validateYamlOneFile(filePath)
  } else {
    walk(process.cwd(), {
      everyFile (relPath) {
        if (relPath.toLowerCase().indexOf('.yml') > -1) {
          validateYamlOneFile(relPath)
        }
      }
    })
  }
}

commander
  .command('yaml-validate [input]').alias('yv')
  .description('Validate the yaml files.')
  .action(actionYamlValidate)

/*******************************************************************************
 * main
 ******************************************************************************/

commander.parse(process.argv)

// [
//  '/usr/local/bin/node',
//  '/home/jf/.npm-packages/bin/baldr-media-server-cli'
// ]
if (process.argv.length <= 2) {
  actionHelp()
}
