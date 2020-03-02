// Node packages.
const fs = require('fs')

// Third party packages.
const wikibase = require('wikibase-sdk')({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
})
const fetch = require('node-fetch')

// Project packages.
const {
  asciify
} = require('@bldr/api-media-server')
const { runImagemagick, writeMetaDataYamlFile } = require('../lib.js')

function getWikipediaTitle (sitelinks) {
  let key
  if (sitelinks.dewiki) {
    key = 'dewiki'
  } else {
    key = 'enwiki'
  }
  // https://de.wikipedia.org/wiki/Ludwig_van_Beethoven
  const siteLink = wikibase.getSitelinkUrl({ site: key, title: sitelinks[key] })
  if (!siteLink) return
  // {
  //   lang: 'de',
  //   project: 'wikipedia',
  //   key: 'dewiki',
  //   title: 'Ludwig_van_Beethoven',
  //   url: 'https://de.wikipedia.org/wiki/Ludwig_van_Beethoven'
  // }
  const linkData = wikibase.getSitelinkData(siteLink)
  return `${linkData.lang}:${linkData.title}`
}

async function getItem (itemId) {
  const url = wikibase.getEntities(itemId, ['en', 'de'])
  const response = await fetch(url)
  const json = await response.json()
  const entites = await wikibase.parse.wd.entities(json)
  return entites[itemId]
}

function formatDate (date) {
  // [ '1770-12-16T00:00:00.000Z' ]
  if (!date) return
  return date.replace(/T.+$/, '')
}

class Claims {
  constructor (claims) {
    this.claims = claims
  }

  getClaim (claim) {
    let result
    if (this.claims[claim]) {
      result = this.claims[claim]
    }
    if (!result) return
    if (Array.isArray(result)) {
      return result[0]
    }
    return result
  }

  getDate (claim) {
    return formatDate(this.getClaim(claim))
  }

  async getName (claim) {
    //  Name in Amts- oder Originalsprache (P1705)  ?
    const itemId = this.getClaim(claim)
    if (!itemId) return
    const entity = await getItem(itemId)
    if (entity.labels.de) {
      return entity.labels.de
    } else {
      return entity.labels.en
    }
  }
}

async function downloadFile (url, dest) {
  const response = await fetch(url)
  fs.writeFileSync(dest, Buffer.from(await response.arrayBuffer()))
}

async function downloadWikicommonsFile (filename, dest) {
  const url = wikibase.getImageUrl(filename)
  await downloadFile(url, dest)
}

async function action (itemId) {
  if (!wikibase.isItemId(itemId)) {
    throw new Error(`No item id: ${itemId}`)
  }

  const entity = await getItem(itemId)
  console.log(entity)
  const claims = new Claims(entity.claims)

  // Name in Muttersprache (P1559)
  let name = claims.getClaim('P1559')
  const firstname = await claims.getName('P735')
  const lastname = await claims.getName('P734')
  if (!name) name = `${firstname} ${lastname}`
  const id = asciify(`${lastname}_${firstname}`)
  const title = `Portrait-Bild von „${name}“`

  let short_biography
  const desc = entity.descriptions
  if (desc.de) { short_biography = desc.de } else if (desc.en) { short_biography = desc.en }

  const birth = claims.getDate('P569')
  const death = claims.getDate('P570')
  const wikidata = itemId
  const wikipedia = getWikipediaTitle(entity.sitelinks)
  const wikicommons = claims.getClaim('P18')
  const dest = `${id}.jpg`
  if (wikicommons) {
    await downloadWikicommonsFile(wikicommons, dest)
  }

  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest)
    if (stat.size > 500000) {
      runImagemagick(dest, dest)
    }
  }

  const result = { id, title, firstname, lastname, name, short_biography, birth, death, wikidata, wikipedia, wikicommons }

  for (const key in result) {
    if (!result[key]) {
      delete result[key]
    }
  }
  writeMetaDataYamlFile(`${dest}.yml`, result)
}

module.exports = {
  commandName: 'wikidata <item-id>',
  alias: 'w',
  description: 'Query wikidata.org (currently only support for the master slide person).',
  action
}
