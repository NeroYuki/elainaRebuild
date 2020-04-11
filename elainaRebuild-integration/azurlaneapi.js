const log = require('../elainaRebuild-utils/log.js')
const apiParamBuilder = require('../elainaRebuild-utils/apiParamBuilder.js')
const request = require('request')

const GATEWAY_ENDPOINT = ["http://blhxusgate.yo-star.com", "http://blhxjploginapi.azurlane.jp", "118.178.152.242"]

async function azurlaneApiCall(param, index) {
    return new Promise((resolve, reject) => {
        let url = GATEWAY_ENDPOINT[index] + param.toString();
        request(url, {}, (err, res, body) => {
            if (err) {
                log.errConsole(err)
                reject()
            }
            if (res.statusCode != 200) {
                log.errConsole("Non-200 status code")
                reject()
            }
            try {
                data = JSON.parse(body)
                resolve(data)
            }
            catch (err) {
                log.errConsole(err)
                reject()
            }
        })
    }).catch()
}

module.exports.serverStatus = (option) => {
    return new Promise(async (resolve, reject) => {
        let region = 'en'
        let region_index = 0;
        if (option.region !== undefined) region = option.region

        const available_region = ['en', 'jp', 'cn-a']

        if (available_region.indexOf(region) != -1) {
            region_index = available_region.indexOf(region)
        }
        else {
            log.errConsole("Unknown region")
            reject()
        }

        let param = new apiParamBuilder("")
        param.addParam("cmd", "load_server?")

        let result = await azurlaneApiCall(param, region_index)

        if (result === undefined) reject()

        let statusResult = []
        const state_code = ["Normal", "Offline", "Full", "Busy"]
        const flag_code = ["Normal", "Hot", "New"]

        result.forEach((serverStatus) => {
            let serverStatus_entry = {
                id: parseInt(serverStatus.id),
                name: serverStatus.name,
                state: state_code[parseInt(serverStatus.state)] || "unknown",
                flag: flag_code[parseInt(serverStatus.flag)] || "unknown",
                priority: parseInt(serverStatus.sort)
            }
            statusResult.push(serverStatus_entry)
        })

        resolve(statusResult)
    }).catch()
}