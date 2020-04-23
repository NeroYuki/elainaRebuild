const fs = require('fs')
const replayParser = require('../elainaRebuild-utils/replayParser.js')

let filename = '8326628.odr'

fs.readFile(filename, async (err, data) => {
    if (err) throw err
    console.log(data.length)
    console.log(data)
    let analyzed_data = await replayParser.parse(data)
    console.log(analyzed_data)
})