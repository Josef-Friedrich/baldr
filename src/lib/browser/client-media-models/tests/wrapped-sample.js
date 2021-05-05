/* globals describe it */

const assert = require('assert')

const { WrappedSampleList } = require('../dist/node/wrapped-sample')

const test = {
  meta: {
    ref: 'EP_common_audioOverlay'
  },
  slides: [
    {
      title: 'Without titles',
      score_sample: {
        heading: 'Hook-Line',
        score: 'ref:Final-Countdown_NB_The-Final-Countdown'
      },
      audio_overlay: [
        'ref:Final-Countdown_HB_The-Final-Countdown#blaeser-intro',
        'ref:Final-Countdown_HB_Mere-Rang-Mein-Rangne#blaeser-intro'
      ]
    },
    {
      title: 'With titles',
      score_sample: {
        heading: 'Hook-Line',
        score: 'ref:Final-Countdown_NB_The-Final-Countdown'
      },
      audio_overlay: [
        {
          uri: 'ref:Final-Countdown_HB_The-Final-Countdown#blaeser-intro',
          title: 'Original'
        },
        {
          uri: 'ref:Final-Countdown_HB_Mere-Rang-Mein-Rangne#blaeser-intro',
          title: 'Bollywood'
        }
      ]
    },
    {
      title: 'Object: only uri, long form, show titles',
      score_sample: {
        heading: 'Der Gnome',
        score: 'uuid:949c3b21-b0c5-4730-bf04-15a4d5dff7fd'
      },
      audio_overlay: {
        show_titles: true,
        samples: [
          {
            uri: 'uuid:337010d0-732b-400f-a516-6f0bec91ed7b'
          },
          {
            uri: 'uuid:2dbdb1c0-0882-40fa-b0a6-7552effa2d32'
          }
        ]
      }
    },
    {
      title: 'Only one sample',
      score_sample: {
        heading: 'Das große Tor von Kiew',
        score: 'uuid:910699a5-d682-4053-8c96-64961596d242'
      },
      audio_overlay: [
        {
          uri: 'uuid:c64047d2-983d-4009-a35f-02c95534cb53'
        }
      ]
    },
    {
      title: 'Over image. Input string',
      image: {
        src: 'uuid:910699a5-d682-4053-8c96-64961596d242'
      },
      audio_overlay: 'uuid:c64047d2-983d-4009-a35f-02c95534cb53'
    },
    {
      title: 'URI and title in one string',
      task: 'URI and title in one string',
      audio_overlay: [
        'ref:Beatles-Strawberry_HB_Demoversion',
        'ref:Beatles-Strawberry_HB_Studioversion-von-1966 ersten Studioversion vom 24. November 1966',
        'ref:Beatles-Strawberry_HB_Plattenfassung fertige Produktion'
      ]
    }
  ]
}

function createSamples(input) {
  const list = new WrappedSampleList(input)
  return list.samples
}

function createSamplesGetFirst(input) {
  const samples = createSamples(input)
  return samples[0]
}

describe('Class “WrappedSampleList()”', function () {
  it('Single URI as a string', function () {
    const sample = createSamplesGetFirst('ref:test')
    assert.strictEqual(sample.uri, 'ref:test')
  })
  it('Single URI as an array', function () {
    const sample = createSamplesGetFirst(['ref:test'])
    assert.strictEqual(sample.uri, 'ref:test')
  })
})
