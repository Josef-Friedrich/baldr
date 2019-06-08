#! /usr/bin/env node

let glob = require('glob')
var Mocha = require('mocha')
let util = require('util')

console.log('Environment:\n')
console.log(process.env)
console.log('\n\n')

let files = glob.sync('*.test.js', { ignore: ['**/node_modules/**', '**/dist/**'], matchBase: true })

let mocha = new Mocha()

for (let file of files) {
  console.log(util.format('Load test file: %s', file))
  mocha.addFile(file)
}

// Run the tests.
mocha.run(function (failures) {
  process.exitCode = failures ? 1 : 0
})
