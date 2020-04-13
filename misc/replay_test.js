const fs = require('fs')
const replayParser = require('../elainaRebuild-utils/replayParser.js')

let filename = '<filename>.odr'

fs.readFile(filename, async (err, data) => {
    if (err) throw err
    let analyzed_data = await replayParser.parse(data)
    console.log(analyzed_data)
})