const {assert} = require('./lib/helper.js');
const path = require('path');
const fs = require('fs-extra');
const json = require('../json.js');
const rewire = require('rewire')('../json.js');

describe('file “json.js”', () => {

  it('function “generateSongJSON()”', () => {
    var info = rewire.__get__('generateSongJSON')(path.join(
      path.resolve('test', 'songs', 'processed', 'some'),
      'a',
      'Auf-der-Mauer_auf-der-Lauer'
    ));
    assert.equal(
      info.title,
      'Auf der Mauer, auf der Lauer'
    );
  });

  it('function “generateJSON()”', () => {
    var jsonFile = path.join('test', 'songs', 'processed', 'some', 'songs.json');
    json.generateJSON(path.join('test', 'songs', 'processed', 'some'));
    assert.exists(jsonFile);
    var tree = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    assert.equal(
      tree.a['Auf-der-Mauer_auf-der-Lauer'].title,
      'Auf der Mauer, auf der Lauer'
    );
    fs.removeSync(jsonFile);
  });

  it('function “readJSON()”', () => {
    json.generateJSON(path.resolve('test', 'songs', 'processed', 'some'));
    var jsonContent = json.readJSON(path.resolve('test', 'songs', 'processed', 'some'));
    assert.equal(
      jsonContent.a['Auf-der-Mauer_auf-der-Lauer'].title,
      'Auf der Mauer, auf der Lauer'
    );
  });

});
