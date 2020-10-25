/**
 * Low level classes and functions used by the node packages. Some helper
 * functions etc.
 *
 * @module @bldr/core-node
 */

// Node packages.
import childProcess from 'child_process'
import fs from 'fs'
import util from 'util'

// Third party packages
import git from 'git-rev-sync'

/**
 * Wrapper around `util.format()` and `console.log()`
 */
export function log (format: string) {
  const args = Array.from(arguments).slice(1)
  console.log(util.format(format, ...args))
}

/**
 * Generate a revision string in the form version-gitshort(-dirty)
 */
export function gitHead (): object {
  return {
    short: git.short(),
    long: git.long(),
    isDirty: git.isDirty()
  }
}

/**
 * Check if some executables are installed. Throws an error if not.
 *
 * @param executables - An array of executables names or a
 *   a single executable as a string.
 */
export function checkExecutables (executables: string | string[]) {
  if (!Array.isArray(executables)) executables = [executables]
  for (const executable of executables) {
    const process = childProcess.spawnSync('which', [executable], { shell: true })
    if (process.status !== 0) {
      throw new Error(`Executable is not available: ${executable}`)
    }
  }
}

/**
 * Get the page count of an PDF file. You have to install the command
 * line utility `pdfinfo` from the Poppler PDF suite.
 *
 * @see {@link https://poppler.freedesktop.org}
 *
 * @param filePath - The path on an PDF file.
 */
export function getPdfPageCount (filePath: string): number {
  checkExecutables('pdfinfo')
  if (!fs.existsSync(filePath)) throw new Error(`PDF file doesn’t exist: ${filePath}.`)
  const proc = childProcess.spawnSync(
    'pdfinfo', [filePath],
    { encoding: 'utf-8', cwd: process.cwd() }
  )
  const match = proc.stdout.match(/Pages:\s+(\d+)/)
  if (match) {
    return parseInt(match[1])
  }
  return 0
}

export default {
  checkExecutables,
  getPdfPageCount,
  gitHead,
  log
}