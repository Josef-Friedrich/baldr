const {assert} = require('./lib/helper.js');
const path = require('path');
const fs = require('fs');
const tex = require('../tex.js');
const rewire = require('rewire')('../tex.js');

describe('file “tex.js”', () => {

  it('function “texCmd()”', () => {
    var texCmd = rewire.__get__('texCmd');
    assert.equal(texCmd('lorem', 'ipsum'), '\\tmplorem{ipsum}\n');
  });

  it('function “texABC()”', () => {
    var texAlpha = rewire.__get__('texABC');
    assert.equal(texAlpha('a'), '\n\n\\tmpchapter{A}\n');
  });

  it('function “texSong()”', () => {
    let texSong = rewire.__get__('texSong');
    let basePath = path.resolve('test', 'songs', 'processed', 'some');
    let songPath = path.join(basePath, 's', 'Swing-low');
    assert.equal(
      texSong(basePath, songPath),
      '\n' +
      '\\tmpheading{Swing low}\n' +
      '\\tmpimage{s/Swing-low/piano/piano_1.eps}\n' +
      '\\tmpimage{s/Swing-low/piano/piano_2.eps}\n' +
      '\\tmpimage{s/Swing-low/piano/piano_3.eps}\n'
    );
  });

  it('function “generateTeX()”', () => {
    texFile = path.join('test', 'songs', 'processed', 'some', 'songs.tex');
    tex.generateTeX(path.resolve('test', 'songs', 'processed', 'some'));
    assert.exists(texFile);

    var texContent = fs.readFileSync(texFile, 'utf8');
    var compare = fs.readFileSync(
      path.join('test', 'files', 'songs_processed.tex'), 'utf8'
    );

    assert.equal(texContent, compare);

    assert.ok(texContent.indexOf('\\tmpimage') > -1);
    assert.ok(texContent.indexOf('\\tmpheading') > -1);
  });

});
