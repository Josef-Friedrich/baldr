/**
 * Build the main menu for the Electron app and build a menu for the
 * web app.
 *
 * @module @bldr/lamp/menu
 */

/**
 * @typedef menuEntry
 * @property label - A short label of the menu entry.
 * @property description - A longer description of the menu entry.
 * @property action - For example “pushRoute”, “openExternalUrl”, “execute”
 * @property arguments - Arguments for the action function.
 * @property submenu - A array of menu entries to build a sub menu from.
 */

const menuTemplate = [
  {
    label: 'Navigation',
    submenu: [
      {
        label: 'Themen',
        action: 'pushRouter',
        arguments: 'topics'
      },
      {
        label: 'Master Dokumentation',
        action: 'pushRouter',
        arguments: 'documentation'
      },
      {
        label: 'Ad-Hoc-Folien',
        submenu: [
          {
            label: 'Hefteintrag',
            action: 'pushRouter',
            arguments: 'editor'
          },
          {
            label: 'Dokumentenkamera',
            action: 'pushRouter',
            arguments: 'camera'
          }
        ]
      },
      {
        label: 'API Dokumentation',
        action: 'openExternalUrl',
        arguments: 'https://josef-friedrich.github.io/baldr/'
      }
    ]
  },
  {
    label: 'Aktionen',
    submenu: [
      {
        label: 'Aktualsieren',
        description: 'Lokalen Medienserver aktualisieren.',
        action: 'execute',
        arguments: 'update'
      },
      {
        label: 'Öffnen ...',
        submenu: [
          {
            label: 'Präsentation (Editor)',
            desciption: 'Die aktuelle Präsentation im Editor öffnen',
            action: 'execute',
            arguments: 'openEditor',
            accelerator: 'CmdOrCtrl+e'
          },
          {
            label: 'Mediendatei (Editor)',
            desciption: 'Die erste Mediendatei der aktuellen Folien im Editor öffnen.',
            action: 'execute',
            arguments: 'openMedia',
            accelerator: 'CmdOrCtrl+a'
          },
          {
            label: 'Übergeordneter Ordner',
            desciption: 'Den übergeordneten Ordner der Präsentation öffnen',
            action: 'execute',
            arguments: 'openParent',
            accelerator: 'CmdOrCtrl+Alt+e'
          },
          {
            label: 'Übergeordneter Ordner und Archivorder',
            desciption: 'Den übergeordneten Ordner der Präsentation, sowie den dazugehörenden Archivordner öffnen',
            action: 'execute',
            arguments: 'openParentArchive',
            accelerator: 'CmdOrCtrl+Shift+Alt+e'
          },
          {
            label: 'Präsentation (Editor), übergeordneter Ordner und Archivorder',
            desciption: 'Vollständiger Editiermodus: Den übergeordneten Ordner der Präsentation, sowie den dazugehörenden Archivordner, als auch den Editor öffnen',
            action: 'execute',
            arguments: 'openEditorParentArchive',
            accelerator: 'CmdOrCtrl+Alt+r'
          }
        ]
      }
    ]
  },
  {
    label: 'Ansicht',
    submenu: [
      {
        label: 'Schriftgröße zurücksetzen',
        description: 'Die aktuelle Folie auf den Skalierungsfaktor 1 (zurück)setzen.',
        action: 'execute',
        arguments: 'resetSlideScaleFactor',
        accelerator: 'CmdOrCtrl+1'
      },
      {
        label: 'Schriftgröße vergrößern',
        description: 'Die aktuelle Folie vergrößern.',
        action: 'execute',
        arguments: 'increaseSlideScaleFactor',
        accelerator: 'CmdOrCtrl+2'
      },
      {
        label: 'Schriftgröße verkleinern',
        description: 'Die aktuelle Folie verkleinern.',
        action: 'execute',
        arguments: 'decreaseSlideScaleFactor',
        accelerator: 'CmdOrCtrl+3'
      },
      {
        label: 'Zwischen zwei Folien hin- und herschalten.',
        action: 'execute',
        arguments: 'toggleSlides',
        accelerator: 'CmdOrCtrl+y'
      }
    ]
  }
]

export default menuTemplate
