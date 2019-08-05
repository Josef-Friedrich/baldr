/**
 * @file A collection of function and classes not using the DOM
 * @module @bldr/songbook-base
 */

'use strict'

// Node packages.
const os = require('os')
const path = require('path')
const util = require('util')

// Third party packages.
const fs = require('fs-extra')
const glob = require('glob')
const yaml = require('js-yaml')
require('colors')

/**
 * An array of song objects.
 * @typedef {module:baldr-songbook~Song[]} songs
 */

/*******************************************************************************
 * Functions
 ******************************************************************************/

/**
 * By default this module reads the config file ~/.baldr.json to generate its
 * config object.
 */
function bootstrapConfig () {
  const configDefault = {
    force: false
  }

  // default object
  let config = configDefault

  // config file
  const configFile = path.join(os.homedir(), '.baldr.json')
  const configFileExits = fs.existsSync(configFile)
  if (configFileExits) {
    config = Object.assign(config, require(configFile).songbook)
  }

  if (process.env.BALDR_SONGBOOK_PATH) {
    config.path = process.env.BALDR_SONGBOOK_PATH
  }

  if (!config.path || config.path.length === 0) {
    message.noConfigPath()
  }
  return config
}

function parseSongIDList (listPath) {
  const content = fs.readFileSync(listPath, { encoding: 'utf-8' })
  return content.split(/\s+/).filter(songID => songID)
}

/**
 * Sort alphabetically an array of objects by some specific property.
 *
 * @param {String} property Key of the object to sort.
 * @see {@link https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript Tutorial}
 */
function sortObjectsByProperty (property) {
  return function (a, b) {
    return a[property].localeCompare(b[property])
  }
}

/**
 * List files in a a directory. You have to use a filter to
 * select the files.
 *
 * @param {string} basePath - A directory
 * @param {string} filter - String to filter, e. g. “.eps”
 *
 * @return {array} An array of file names.
 */
function listFiles (basePath, filter) {
  if (fs.existsSync(basePath)) {
    return fs.readdirSync(basePath).filter((file) => {
      return file.indexOf(filter) > -1
    })
  }
  return []
}

/*******************************************************************************
 * Utility classes
 ******************************************************************************/

class Message {
  constructor () {
    this.error = '☒'.red
    this.finished = '☑'.green
    this.progress = '☐'.yellow
  }

  /**
   * Print out and return text.
   *
   * @param {string} text - Text to display.
   */
  print (text) {
    console.log(text)
    return text
  }

  /**
   *
   */
  noConfigPath () {
    let output = this.error + '  Configuration file ' +
      '“~/.baldr.json” not found!\n' +
      'Create such a config file or use the “--base-path” option!'

    const sampleConfig = fs.readFileSync(
      path.resolve(__dirname, '..', 'sample.config.json'), 'utf8'
    )
    output += '\n\nExample configuration file:\n' + sampleConfig

    this.print(output)
    throw new Error('No configuration file found.')
  }

  /**
   * @param {object} status
   * <pre><code>
   * {
   *   "changed": {
   *     "piano": false,
   *     "slides": false
   *   },
   *   "folder": "songs/a/Auf-der-Mauer",
   *   "folderName": "Auf-der-Mauer",
   *   "force": true,
   *   "generated": {
   *     "piano": [
   *       "piano_1.eps",
   *       "piano_2.eps"
   *     ],
   *     "projector": "projector.pdf",
   *     "slides": [
   *       "01.svg",
   *       "02.svg"
   *     ],
   *   },
   *   "info": {
   *     "title": "Auf der Mauer, auf der Lauer"
   *   }
   * }
   * </code></pre>
   */
  songFolder (status, song) {
    let forced
    if (status.force) {
      forced = ' ' + '(forced)'.red
    } else {
      forced = ''
    }

    let symbol
    if (!song.metaData.title) {
      symbol = this.error
    } else if (!status.changed.slides && !status.changed.piano) {
      symbol = this.finished
    } else {
      symbol = this.progress
    }

    let title
    if (!song.metaData.title) {
      title = status.folderName.red
    } else if (!status.changed.slides && !status.changed.piano) {
      title = status.folderName.green + ': ' + song.metaData.title
    } else {
      title = status.folderName.yellow + ': ' + song.metaData.title
    }

    let output = symbol + '  ' + title + forced
    if (status.generated.slides) {
      output +=
        '\n\t' +
        'slides'.yellow +
        ': ' +
        status.generated.slides.join(', ')
    }

    if (status.generated.piano) {
      output +=
        '\n\t' +
        'piano'.yellow +
        ': ' +
        status.generated.piano.join(', ')
    }
    this.print(output)
  }
}

const message = new Message()

/**
 * A wrapper class for a folder.
 */
class Folder {
  /**
   * @param {...string} folderPath - The path segments of the folder
   */
  constructor (folderPath) {
    /**
     * The path of the folder.
     * @type {string}
     */
    this.folderPath = path.join(...arguments)
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true })
    }
  }

  /**
   * Return the path of the folder.
   *
   * @returns {string}
   */
  get () {
    return this.folderPath
  }

  /**
   * Empty the folder (Delete all it’s files).
   */
  empty () {
    fs.removeSync(this.folderPath)
    fs.mkdirSync(this.folderPath)
  }

  /**
   * Remove the folder.
   */
  remove () {
    fs.removeSync(this.folderPath)
  }
}

/*******************************************************************************
 * Song classes
 ******************************************************************************/

/**
 * Metadata of a song catched from the info.yml file.
 *
 * info.yml
 *
 *     ---
 *     alias: I’m sitting here
 *     arranger: Josef Friedrich
 *     artist: Fools Garden
 *     composer: Heinz Müller / Manfred Meier
 *     country: Deutschland
 *     genre: Spiritual
 *     lyricist: Goethe
 *     musescore: https://musescore.com/user/12559861/scores/4801717
 *     source: http://wikifonia.org/node/9928/revisions/13488/view
 *     subtitle: A very good song
 *     title: Lemon tree
 *     year: 1965
 */
class SongMetaData {
  /**
   * @param {string} folder - Path of the song folder.
   */
  constructor (folder) {
    /**
     * Alias for a song title, e. g. “Sehnsucht nach dem Frühlinge” “Komm,
     * lieber Mai, und mache”
     *
     * @type {string}
     */
    this.alias = null

    /**
     * .
     *
     * @type {string}
     */
    this.arranger = null

    /**
     * .
     *
     * @type {string}
     */
    this.artist = null

    /**
     * .
     *
     * @type {string}
     */
    this.composer = null

    /**
     * .
     *
     * @type {string}
     */
    this.country = null

    /**
     * .
     *
     * @type {string}
     */
    this.genre = null

    /**
     * .
     * @type {string}
     */
    this.lyricist = null

    /**
     * .
     * @type {string}
     */
    this.musescore = null

    /**
     * .
     * @type {string}
     */
    this.source = null

    /**
     * .
     *
     * @type {string}
     */
    this.subtitle = null

    /**
     * .
     *
     * @type {string}
     */
    this.title = null

    /**
     * .
     *
     * @type {string}
     */
    this.year = null

    /**
     * The file name of the YAML file.
     *
     * @type {string}
     */
    this.yamlFile = 'info.yml'

    /**
     * All in the YAML file “info.yml” allowed properties (keys).
     *
     * @type {arry}
     */
    this.allowedProperties = [
      'alias',
      'arranger',
      'artist',
      'composer',
      'country',
      'description',
      'genre',
      'lyricist',
      'musescore',
      'source',
      'subtitle',
      'title',
      'wikipedia',
      'year',
      'youtube'
    ]

    if (!fs.existsSync(folder)) {
      throw new Error(util.format('Song folder doesn’t exist: %s', folder))
    }

    /**
     * The path of then parent song folder.
     *
     * @type {string}
     */
    this.folder = folder

    const ymlFile = path.join(folder, this.yamlFile)
    if (!fs.existsSync(ymlFile)) {
      throw new Error(util.format('YAML file could not be found: %s', ymlFile))
    }
    const raw = yaml.safeLoad(fs.readFileSync(ymlFile, 'utf8'))

    for (const key in raw) {
      if (!this.allowedProperties.includes(key)) {
        throw new Error(util.format('Unsupported key: %s', key))
      }
      this[key] = raw[key]
    }
  }

  toJSON () {
    const output = {}
    for (const key of this.allowedProperties) {
      if (this[key]) {
        output[key] = this[key]
      }
    }
    return output
  }
}

/**
 * Combine some song metadata properties
 *
 * Mapping
 *
 * * title: title (year)
 * * subtitle: subtitle - alias - country
 * * composer: composer, artist, genre
 * * lyricist: lyricist
 */
class SongMetaDataCombined {
  /**
   * @param {module:baldr-songbook~SongMetaData} songMetaData - A song
   * metadata object.
   */
  constructor (songMetaData) {
    this.metaData = songMetaData
  }

  /**
   * Extract values of given properties of an object and collect it in
   * an array.
   *
   * @params {array} properties - Some object properties to collect strings from.
   * @params {object} object - An object.
   */
  static collectProperties_ (properties, object) {
    const parts = []
    for (const property of properties) {
      if (property in object && object[property]) {
        parts.push(object[property])
      }
    }
    return parts
  }

  /**
   * title (year)
   */
  get title () {
    let out
    if ('title' in this.metaData) {
      out = this.metaData.title
    } else {
      out = ''
    }

    if ('year' in this.metaData && this.metaData.year) {
      return `${out} (${this.metaData.year})`
    } else {
      return out
    }
  }

  /**
   * subtitle - alias - country
   */
  get subtitle () {
    return SongMetaDataCombined.collectProperties_(
      ['subtitle', 'alias', 'country'],
      this.metaData
    ).join(' - ')
  }

  /**
   * composer, artist, genre
   */
  get composer () {
    let properties
    if (this.metaData.composer === this.metaData.artist) {
      properties = ['composer', 'genre']
    } else {
      properties = ['composer', 'artist', 'genre']
    }
    return SongMetaDataCombined.collectProperties_(
      properties,
      this.metaData
    ).join(', ')
  }

  /**
   * lyricist
   */
  get lyricist () {
    if (
      'lyricist' in this.metaData &&
      this.metaData.lyricist &&
      this.metaData.lyricist !== this.metaData.artist &&
      this.metaData.lyricist !== this.metaData.composer
    ) {
      return this.metaData.lyricist
    } else {
      return ''
    }
  }

  toJSON () {
    return {
      title: this.title,
      subtitle: this.subtitle,
      composer: this.composer,
      lyricist: this.lyricist
    }
  }
}

/**
 * One song
 */
class Song {
  /**
   * @param {string} songPath - The path of the directory containing the song
   * files or a path of a file inside the song folder (not nested in subfolders)
   */
  constructor (songPath) {
    /**
     * The directory containing the song files.
     *
     * @type {string}
     */
    this.folder = this.normalizeSongFolder_(songPath)

    /**
     * The character of the alphabetical folder. The song folders must
     * be placed in alphabetical folders.
     *
     * @type {string}
     */
    this.abc = this.recognizeABCFolder_(this.folder)

    /**
     * The songID is the name of the directory which contains all song
     * files. It is used to sort the songs. It must be unique along all
     * songs.
     *
     * @type {string}
     */
    this.songID = path.basename(this.folder)

    /**
     * An instance of the class SongMetaData().
     * @type {module:baldr-songbook~SongMetaData}
     */
    this.metaData = new SongMetaData(this.folder)

    /**
     * An instance of the class SongMetaDataCombined().
     * @type {module:baldr-songbook~SongMetaDataCombined}
     */
    this.metaDataCombined = new SongMetaDataCombined(this.metaData)

    /**
     * The slides folder
     *
     * @type {module:baldr-songbook~Folder}
     */
    this.folderSlides = new Folder(this.folder, 'slides')

    /**
     * The piano folder
     *
     * @type {module:baldr-songbook~Folder}
     */
    this.folderPiano = new Folder(this.folder, 'piano')

    /**
     * Path of the MuseScore file 'projector.mscx', relative to the base folder
     * of the song collection.
     *
     * @type string
     */
    this.mscxProjector = this.detectFile_('projector.mscx')

    /**
     * Path of the MuseScore file for the piano parts, can be 'piano.mscx'
     * or 'lead.mscx', relative to the base folder
     * of the song collection.
     *
     * @type string
     */
    this.mscxPiano = this.detectFile_('piano.mscx', 'lead.mscx')

    /**
     * An array of piano score pages in the EPS format.
     *
     * @type {array}
     */
    this.pianoFiles = listFiles(this.folderPiano.get(), '.eps')

    /**
     * An array of slides file in the SVG format.
     *
     * @type {array}
     */
    this.slidesFiles = listFiles(this.folderSlides.get(), '.svg')
  }

  /**
   * Get the song folder.
   *
   * @param {string} songPath - The path of the directory containing the song
   *   files or a path of a file inside the song folder (not nested in
   *   subfolders) or a non-existing song path.
   *
   * @return {string} The path of the parent directory of the song.
   */
  normalizeSongFolder_ (songPath) {
    try {
      const stat = fs.lstatSync(songPath)
      if (stat.isDirectory()) {
        return songPath
      } else if (stat.isFile()) {
        return path.dirname(songPath)
      }
    } catch (error) {
      return songPath.replace(`${path.sep}info.yml`, '')
    }
  }

  /**
   * @param {string} folder - The directory containing the song files.
   *
   * @return {string} A single character
   */
  recognizeABCFolder_ (folder) {
    const pathSegments = folder.split(path.sep)
    const abc = pathSegments[pathSegments.length - 2]
    return abc
  }

  /**
   * Detect a file inside the song folder. Throw an exception if the
   * file doesn’t exist.
   *
   * @param {string} file - A filename of a file inside the song folder.
   *
   * @return A joined path of the file relative to the song collection
   *   base dir.
   */
  detectFile_ (file) {
    let absPath
    for (const argument of arguments) {
      absPath = path.join(this.folder, argument)
      if (fs.existsSync(absPath)) {
        return absPath
      }
    }
    throw new Error(util.format('File doesn’t exist: %s', absPath))
  }

  toJSON () {
    return {
      abc: this.abc,
      folder: this.folder,
      metaData: this.metaData,
      metaDataCombined: this.metaDataCombined,
      songID: this.songID,
      slidesCount: this.slidesFiles.length
    }
  }
}

/*******************************************************************************
 * Classes for multiple songs
 ******************************************************************************/

/**
 * A tree of songs where the song arrays are placed in alphabetical properties.
 * An instanace of this class would look like this example:
 *
 * <pre><code>
 * {
 *   "a": [ song, song ],
 *   "s": [ song, song ],
 *   "z": [ song, song ]
 * }
 * </code></pre>
 */
class AlphabeticalSongsTree {
  /**
   * @param {module:baldr-songbook~songs} songs - An array of song objects.
   */
  constructor (songs) {
    for (const song of songs) {
      if (!{}.hasOwnProperty.call(this, song.abc)) this[song.abc] = []
      this[song.abc].push(song)
    }
    for (const abc in this) {
      this[abc].sort(sortObjectsByProperty('songID'))
    }
  }
}

/**
 * The song library - a collection of songs
 */
class Library {
  /**
   * @param {string} - The base path of the song library
   */
  constructor (basePath) {
    /**
     * The base path of the song library
     *
     * @type {string}
     */
    this.basePath = basePath

    /**
     * The collection of songs
     *
     * @type {object}
     */
    this.songs = this.collectSongs_()

    /**
     * An array of song IDs.
     *
     * @type {array}
     */
    this.songIDs = Object.keys(this.songs)

    /**
     * The current index of the array this.songIDs. Used for the methods
     * getNextSong and getPreviousSong
     *
     * @type {integer}
     */
    this.currentSongIndex = 0
  }

  /**
   * @returns {module:baldr-songbook~songs}
   */
  toArray () {
    return Object.values(this.songs)
  }

  /**
   * Count the number of songs in the song library
   *
   * @return {number}
   */
  countSongs () {
    return this.songIDs.length
  }

  /**
   * Update the index of the song IDs array. If a song is opened via the search
   * form, it is possible to go to the next or previous song of the opened song.
   *
   * @param {string} songID
   *
   * @returns {integer} The index in the songIDs array.
   */
  updateCurrentSongIndex (songID) {
    this.currentSongIndex = this.songIDs.indexOf(songID)
    return this.currentSongIndex
  }

  /**
   * Identify a song folder by searching for a file named “info.yml.”
   */
  detectSongs_ () {
    return glob.sync('info.yml', { cwd: this.basePath, matchBase: true })
  }

  /**
   * Collect all songs of a song tree by walking through the folder tree
   * structur.
   *
   * @returns {object} An object indexed with the song ID containing the song
   * objects.
   */
  collectSongs_ () {
    const songs = {}
    for (const songPath of this.detectSongs_()) {
      const song = new Song(path.join(this.basePath, songPath))
      if (song.songID in songs) {
        throw new Error(
          util.format('A song with the same songID already exists: %s',
            song.songID))
      }
      songs[song.songID] = song
    }
    return songs
  }

  /**
   * @param {string} listFile
   *
   * @returns {pbject}
   */
  loadSongList (listFile) {
    const songIDs = parseSongIDList(listFile)
    const songs = {}
    for (const songID of songIDs) {
      if ({}.hasOwnProperty.call(this.songs, songID)) {
        songs[songID] = this.songs[songID]
      } else {
        throw new Error(util.format('There is no song with song ID “%s”', songID))
      }
    }
    this.songs = songs
    return songs
  }

  /**
   * Return only the existing ABC folders.
   *
   * @return {Array}
   */
  getABCFolders_ () {
    const abc = '0abcdefghijklmnopqrstuvwxyz'.split('')
    return abc.filter((file) => {
      const folder = path.join(this.basePath, file)
      if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
        return true
      } else {
        return false
      }
    })
  }

  /**
   * Sort alphabetically an array of objects by some specific property.
   *
   * @param {String} property Key of the object to sort.
   * @see {@link https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript Tutorial}
   */
  sortByProperty_ (property) {
    return function (a, b) {
      return a[property].localeCompare(b[property])
    }
  }

  /**
   * Get the song object from the song ID.
   *
   * @param {string} songID - The ID of the song. (The parent song folder)
   *
   * @return {module:baldr-songbook~Song}
   */
  getSongById (songID) {
    if (songID in this.songs && this.songs[songID]) {
      return this.songs[songID]
    } else {
      throw new Error(util.format('There is no song with the songID: %s',
        songID))
    }
  }

  /**
   * Get the previous song
   *
   * @return {module:baldr-songbook~Song}
   */
  getPreviousSong () {
    if (this.currentSongIndex === 0) {
      this.currentSongIndex = this.countSongs() - 1
    } else {
      this.currentSongIndex -= 1
    }
    return this.getSongById(this.songIDs[this.currentSongIndex])
  }

  /**
   * Get the next song
   *
   * @return {module:baldr-songbook~Song}
   */
  getNextSong () {
    if (this.currentSongIndex === this.countSongs() - 1) {
      this.currentSongIndex = 0
    } else {
      this.currentSongIndex += 1
    }
    return this.getSongById(this.songIDs[this.currentSongIndex])
  }

  /**
   * Get a random song.
   *
   * @return {module:baldr-songbook~Song}
   */
  getRandomSong () {
    return this.getSongById(this.songIDs[Math.floor(Math.random() * this.songIDs.length)])
  }

  toJSON () {
    return this.songs
  }
}

exports.listFiles = listFiles
exports.AlphabeticalSongsTree = AlphabeticalSongsTree
exports.bootstrapConfig = bootstrapConfig
exports.Library = Library
exports.message = message
exports.parseSongIDList = parseSongIDList
exports.Song = Song
exports.Folder = Folder