const log = require('../elainaRebuild-utils/log.js')
const osuapi = require('../elainaRebuild-integration/osuapi.js')
const malodyapi = require('../elainaRebuild-integration/malodyapi.js')

module.exports.run = (client, message, args) => {
    // command only for integration testing
    // osuIntegrationTest(client, message, args)
    malodyIntegrationTest(client, message, args)
}

async function osuIntegrationTest(client, message, args) {
    if (!args[0]) { message.channel.send("Hey at least give me the map :/"); return; }
	var a = args[0].split("/");
    beatmapid = a[a.length-1]
    
    let mapInfo = await osuapi.getBeatmapInfo({beatmapid: beatmapid})
    let mapData = await osuapi.downloadMapFile({beatmapid: beatmapid})
    log.toConsole(JSON.stringify(mapInfo, "", " "))
    log.toConsole(mapData)
    message.channel.send("test complete")
}

async function malodyIntegrationTest(client, message, args) {

    if (!args[0]) { message.channel.send("Hey at least give me the chart :/"); return; }
	var a = args[0].split("/");
    cid = a[a.length-1]

    // let userResult = await malodyapi.getUserInfo({uid: uid})
    // log.toConsole(JSON.stringify(userResult), "", "  ")
    let chartResult = await malodyapi.getChartInfo({chartid: cid})
    log.toConsole(JSON.stringify(chartResult, "", "  "))

    message.channel.send("test complete")
}

module.exports.name = 'test'
module.exports.isEnable = true