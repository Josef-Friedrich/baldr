/**
 * @file Helper module for unit testing baldr.
 * @module baldr-test
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');
const rewire = require('rewire');

/**
 *
 */
exports.assert = assert;

/**
 *
 */
exports.fs = fs;

/**
 *
 */
exports.path = path;

/**
 *
 */
exports.rewire = rewire;

/**
 *
 */
exports.getDOM = getDOM = function(html) {
  let d = new JSDOM(html);
  return d.window.document;
};

/**
 *
 */
exports.allMasters = [
  'audio',
  'camera',
  'editor',
  'image',
  'markdown',
  'person',
  'question',
  'quote',
  'svg'
];

/**
 *
 */
exports.document = getDOM(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'render.html'),
    'utf8'
  )
);

/**
 *
 */
exports.presentation = {
  pwd: '/home/jf/lol'
};

/**
 *
 */
class Spectron {

  /**
   *
   */
  constructor(baldrFile) {
    if (process.platform === 'linux') {
      this.appPath = 'dist/linux-unpacked/baldr';
    }
    else if (process.platform === 'darwin') {
      this.appPath = 'dist/mac/baldr.app/Contents/MacOS/baldr';
    }
    let {Application} = require('spectron');
    let config = {
      path: this.appPath
    };
    if (baldrFile) config.args = [baldrFile];
    this.app = new Application(config);
  }

  /**
   *
   */
  getApp() {
    return this.app;
  }

  /**
   *
   */
  start() {
    return this.app.start();
  }

  /**
   *
   */
  stop() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  }
}

exports.Spectron = Spectron;
