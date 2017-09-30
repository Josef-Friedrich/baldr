/* jshint esversion: 6 */

const {assert} = require('./lib/helper.js');
const path = require('path');
const fs = require('fs-extra');
const jsonSlides = require('../json-slides.js');
const rewire = require('rewire')('../json-slides.js');

describe('json-slides', () => {

  it('"generateSongJSON()"', () => {
    var generateSongJSON = rewire.__get__('generateSongJSON');
    var info = generateSongJSON(path.join(
      path.resolve('songs_processed'),
      'a',
      'Auf-der-Mauer_auf-der-Lauer'
    ));
    assert.equal(
      info.title,
      'Auf der Mauer, auf der Lauer'
    );
  });

  it('"generateJSON()"', () => {
    var json = path.join('songs_processed', 'songs.json');
    jsonSlides.generateJSON('songs_processed');
    assert.exists(json);
    var tree = JSON.parse(fs.readFileSync(json, 'utf8'));
    assert.equal(
      tree.a['Auf-der-Mauer_auf-der-Lauer'].title,
      'Auf der Mauer, auf der Lauer'
    );
    fs.removeSync(json);
  });

});
