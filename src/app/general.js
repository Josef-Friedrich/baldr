/**
 * @file
 * @module baldr-application
 */

'use strict';

class General {

  constructor(document) {

    /**
     *
     */
    this.document = document;

    /**
     *
     */
    this.elemNavigationMenu = this.document.getElementById('nav-general');

    /**
     *
     */
    this.defaultGeneral = [
      {
        title: 'Camera',
        master: 'camera',
        shortcut: 'ctrl+c',
        fontawesome: 'camera'
      },
      {
        title: 'Editor',
        master: 'editor',
        shortcut: '',
        fontawesome: 'file-text'
      },
      {
        title: 'Audio',
        master: 'audio',
        shortcut: '',
        fontawesome: 'volume-up'
      },
      {
        title: 'Video',
        master: 'video',
        shortcut: '',
        fontawesome: 'video-camera'
      },
      {
        title: 'Image',
        master: 'image',
        shortcut: '',
        fontawesome: 'file-image-o'
      },
      {
        title: 'Google',
        master: 'website',
        data: 'https://google.com',
        shortcut: '',
        fontawesome: 'google'
      },
      {
        title: 'Wikipedia',
        master: 'website',
        data: 'https://en.wikipedia.org',
        shortcut: '',
        fontawesome: 'wikipedia-w'
      }
    ];

  }

  /**
   *
   */
  renderButton(title, fontawesome) {
    let button = this.document.createElement('button');
    button.title = title;
    button.classList.add('fa');
    button.classList.add('fa-' + fontawesome);
    return button;
  }

  /**
   *
   */
  renderNavigationMenu() {
    for (let entry of this.defaultGeneral) {
      let button = this.renderButton(entry.title, entry.fontawesome);
      this.elemNavigationMenu.appendChild(button);
    }
  }

  set() {
    this.renderNavigationMenu();
  }
}

exports.General = General;

exports.getGeneral = function(document) {
  return new General(document);
};
