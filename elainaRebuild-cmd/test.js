const log = require('../elainaRebuild-utils/log.js')
const osuapi = require('../elainaRebuild-integration/osuapi.js')
const osudroidapi = require('../elainaRebuild-integration/osudroidapi.js')
const malodyapi = require('../elainaRebuild-integration/malodyapi.js')
const azurlaneapi = require('../elainaRebuild-integration/azurlaneapi.js')
const arcaeaapi = require('../elainaRebuild-integration/arcaeaapi.js')
const replayParser = require('../elainaRebuild-utils/replayParser.js')

module.exports.run = (client, message, args) => {
    // command only for integration testing
    // osuIntegrationTest(client, message, args)
    // malodyIntegrationTest(client, message, args)
    // osudroidIntegrationTest(client, message, args)
    // azurlaneIntegrationTest(client, message, args)
    // arcaeaIntegrationTest(client, message, args)
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

async function osudroidIntegrationTest(client, message, args) {
    if (!args[0]) { message.channel.send("Hey at least give me the uid :/"); return; }
    let sid = args[0]
    let replay_file = await osudroidapi.getReplayFile({sid: sid})
    let analyzed_data = await replayParser.parse(replay_file)
    console.log(analyzed_data)
    // let userInfo = await osudroidapi.getUserInfo({uid: uid})
    // var a = args[0].split("/");
    // bid = a[a.length-1]
    // let mapInfo = await osuapi.getBeatmapInfo({beatmapid: bid})
    // let droidScoreInfo = await osudroidapi.getScoreInfo({hash: mapInfo.file_md5, order: 'score', page: 0})
    // droidScoreInfo.forEach((x) => {
    //     log.toConsole(JSON.stringify(x))
    // })
    // log.toConsole(JSON.stringify(userInfo, "", "  "))
    message.channel.send("test complete")
}

async function malodyIntegrationTest(client, message, args) {

    if (!args[0]) { message.channel.send("Hey at least give me the chart :/"); return; }
	var a = args[0].split("/");
    uid = a[a.length-1]

    let userResult = await malodyapi.getUserInfo({uid: uid})
    log.toConsole(JSON.stringify(userResult), "", "  ")
    // let chartResult = await malodyapi.getChartInfo({chartid: cid})
    // log.toConsole(JSON.stringify(chartResult, "", "  "))

    message.channel.send("test complete")
}

async function azurlaneIntegrationTest(client, message, args) {
    let option = {
        region: 'en'
    }
    if (args[0]) { option.region = args[0] } 

    let serverResult = await azurlaneapi.serverStatus(option)
    log.toConsole(JSON.stringify(serverResult, "", "  "))

    message.channel.send("test complete")
}

async function arcaeaIntegrationTest(client, message, args) {
    let option = {
        uid: undefined,
        username: undefined,
    }
    if (args[0].length == 9 && /\d{9}/.test(args[0])) option.uid = args[0]
    else {
        //log.errConsole("Invalid uid")
        option.username = args[0]
        let lookupResult = await arcaeaapi.lookupUser(option)
        if (lookupResult.length == 0) log.errConsole("Can't find said player, perhaps try to use your user id")
        else {
            log.toConsole(option.username + " found")
            option.uid = lookupResult[0].code
        }
    }

    // if (args[1] !== undefined) option.score_pull = parseInt(args[1])
    // if (args[2] !== undefined && args[3] !== undefined) {
    //     option.min_ptt = parseInt(args[2])
    //     option.max_ptt = parseInt(args[3])
    // }

    let infoResult = await arcaeaapi.getUserInfo(option)
    log.toConsole(JSON.stringify(infoResult, "", "  "))
    // let scoreResult = await arcaeaapi.getScoreInfo(option)
    // log.toConsole(JSON.stringify(scoreResult, "", "  "))

    message.channel.send('test complete')
}

module.exports.name = 'test'
module.exports.isEnable = true