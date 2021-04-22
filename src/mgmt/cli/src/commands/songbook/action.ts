// Third party packages.
import chalk from 'chalk'

// Project packages.
import { log } from '@bldr/core-node'
import {
  IntermediateLibrary,
  GenerationMode
} from '@bldr/songbook-intermediate-files'
import config from '@bldr/config'

interface CmdObj {
  basePath: string
  clean: boolean
  folder: string
  force: boolean
  groupAlphabetically: boolean
  list: string
  pageTurnOptimized: boolean
  piano: boolean
  slides: boolean
  songId: string
}

/**
 * @param cmdObj - An object containing options as key-value pairs.
 *  This parameter comes from `commander.Command.opts()`
 */
function action (cmdObj: CmdObj): void {
  if (cmdObj.folder) {
    cmdObj.force = true
  }

  let mode: GenerationMode
  if (cmdObj.slides) {
    mode = 'slides'
  } else if (cmdObj.piano) {
    mode = 'piano'
  } else {
    mode = 'all'
  }

  if (cmdObj.basePath && cmdObj.basePath.length > 0) {
    config.songbook.path = cmdObj.basePath
  }

  // To avoid strange behavior when creating the piano score
  if (!{}.hasOwnProperty.call(cmdObj, 'groupAlphabetically')) {
    cmdObj.groupAlphabetically = false
  }
  if (!{}.hasOwnProperty.call(cmdObj, 'pageTurnOptimized')) {
    cmdObj.pageTurnOptimized = false
  }

  log(
    'The base path of the song collection is located at:\n    %s\n',
    chalk.cyan(config.songbook.path)
  )

  const library = new IntermediateLibrary(config.songbook.path)
  log('Found %s songs.', library.countSongs())
  if (cmdObj.list) library.loadSongList(cmdObj.list)

  if (cmdObj.clean) {
    library.cleanIntermediateFiles()
  } else if (cmdObj.folder) {
    library.updateSongByPath(cmdObj.folder, mode)
  } else if (cmdObj.songId) {
    library.updateSongBySongId(cmdObj.songId, mode)
  } else {
    library.update(mode, cmdObj.force)

    if (mode === 'piano' || mode === 'all') {
      library.compilePianoScore(
        cmdObj.groupAlphabetically,
        cmdObj.pageTurnOptimized
      )
    }
  }
}

export = action
