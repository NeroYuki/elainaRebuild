const log = require('../elainaRebuild-utils/log.js')
const apiParamBuilder = require('../elainaRebuild-utils/apiParamBuilder.js')
const request = require('request')
require('dotenv').config({ path: 'elainaRebuild-config/.env' })

const API_ENDPOINT = 'http://ops.dgsrz.com/api'
const WEBSITE_ENDPOINT = 'http://ops.dgsrz.com'

var modbits = {
    nomod: 0,
    nf: 1<<0,
    ez: 1<<1,
    td: 1<<2,
    hd: 1<<3,
    hr: 1<<4,
    dt: 1<<6,
    ht: 1<<8,
    nc: 1<<9,
    fl: 1<<10,
    so: 1<<12,
};

function modchar2bit(mod) {
    var res = 0;
    if (mod.includes("e")) res += modbits.ez;
    if (mod.includes("h")) res += modbits.hd;
	if (mod.includes("r")) res += modbits.hr;
	if (mod.includes("d")) res += modbits.dt;
	if (mod.includes("c")) res += modbits.nc;
	if (mod.includes("n")) res += modbits.nf;
	if (mod.includes("t")) res += modbits.ht;
	return res;
}

async function droidApiCall(param) {
    return new Promise((resolve, reject) => {
        let url = API_ENDPOINT + param.toString();
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
                //if api return an odr file, dont split it
                if (!param.toString().includes('.odr')) data = body.split('<br>')
                else { data = body }
                resolve(data)
            }
            catch (err) {
                log.errConsole(err)
                reject()
            }
        })
    }).catch()
}

async function droidProfileCall(param) {
    return new Promise((resolve, reject) => {
        let url = WEBSITE_ENDPOINT + param.toString();
        let profileObject = {
            avatarLink: "",
            location: ""
        }
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
                let lines = body.split('\n');
                for (x = 0; x < lines.length; x++) {
                    if (lines[x].includes('h3 m-t-xs m-b-xs')) {
                        lines[x-3] = lines[x-3].replace('<img src="',"");
                        lines[x-3] = lines[x-3].replace('" class="img-circle">',"");
                        lines[x-3] = lines[x-3].trim();
                        profileObject.avatarLink = lines[x-3];
                        lines[x+1] = lines[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
                        lines[x+1] = lines[x+1].replace("<\/small>","");
                        lines[x+1] = lines[x+1].trim()
                        profileObject.location = lines[x+1]
				    }
                }
                resolve(profileObject)
            }
            catch (err) {
                log.errConsole(err)
                reject()
            }
        })
    }).catch()
}

module.exports.getUserInfo = (option) => {
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.uid === undefined && option.username === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }
        //TODO: add support for no-apikey operation
        if (process.env.OSUDROID_API_KEY === undefined) {
            log.errConsole("No api key is provided")
            reject()
        }
        else {
            let param = new apiParamBuilder("getuserinfo.php")
            param.addParam("apiKey", process.env.OSUDROID_API_KEY)
            if (option.uid !== undefined && !isNaN(parseInt(option.uid))) param.addParam("uid", parseInt(option.uid));
            if (option.username !== undefined) param.addParam("username", option.username)
            let result = await droidApiCall(param)
            //return 2 element: player info (seperated by spaces) and json string include rank and recent play
            let playerInfo = result[0].split(' ')
            if (playerInfo[0] !== "SUCCESS") {
                log.errConsole("User is not found in the database")
                reject()
            }
            let scoreInfo = JSON.parse(result[1])

            let resultObject = {
                uid: parseInt(playerInfo[1]),
                username: playerInfo[2],
                score: parseInt(playerInfo[3]),
                playCount: parseInt(playerInfo[4]),
                accuracy: parseFloat(playerInfo[5]) * 100,
                scoreRank: scoreInfo.rank,
                recentPlays: scoreInfo.recent,
                avatarLink: "",
                location: ""
            }

            //still have to request profile page to get location and avatar link
            //option.fullInfo = false to disable scrapper

            let fullInfo = true;
            if (option.fullInfo !== undefined) fullInfo = Boolean(option.fullInfo)
            if (fullInfo) {
                let profileParam = new apiParamBuilder("profile.php")
                profileParam.addParam("uid", resultObject.uid)
                let profileObject = await droidProfileCall(profileParam)
                resultObject.avatarLink = profileObject.avatarLink
                resultObject.location = profileObject.location
            }

            //return userInfo object
            resolve(resultObject)
        }
    }).catch()
}

module.exports.getReplayFile = (option) => {
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.sid === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }

        let param = new apiParamBuilder("upload")
        param.addCall(option.sid + ".odr")

        let replayResult = await droidApiCall(param)
        if (replayResult === undefined) {
            log.errConsole("Failed to retrieve replay")
            reject()
        } 

        resolve(replayResult)
    }).catch()
}

module.exports.getScoreInfo = (option) => {
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.uid === undefined && option.hash === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }
        if (process.env.OSUDROID_API_KEY === undefined) {
            log.errConsole("No api key is provided")
            reject()
        }

        const available_order = ["sid", "date", "score"]
        //TODO: maybe fallback to v1 if possible?
        let param = new apiParamBuilder("scoresearchv2.php")
        param.addParam("apiKey", process.env.OSUDROID_API_KEY)
        if (option.uid !== undefined && !isNaN(parseInt(option.uid))) param.addParam("uid", parseInt(option.uid));
        if (option.hash !== undefined) param.addParam("hash", option.hash);
        if (option.order !== undefined && available_order.indexOf(option.order) != -1) param.addParam("order", option.order)
        if (option.page !== undefined && !isNaN(parseInt(option.page))) param.addParam("page", parseInt(option.page))

        //log.toConsole(param.toString())

        let result = await droidApiCall(param) 
        result.shift()
        if (result.length == 0) {
            log.errConsole("No score is found with this parameter")
            reject()
        }

        let scoreInfoResult = []
        result.forEach((line) => {
            let components = line.split(' ')
            let scoreInfoEntry = {
                sid: parseInt(components[0]),
                uid: parseInt(components[1]),
                username: components[2],
                score: parseInt(components[3]),
                max_combo: parseInt(components[4]),
                grade: components[5],
                mod: modchar2bit(components[6]),
                acc: parseInt(components[7]) / 1000,
                miss: parseInt(components[8]),
                time: new Date(parseInt(components[9]) * 1000),
                filename: components[10],
                hash: components[11]
            }
            scoreInfoResult.push(scoreInfoEntry)
        })

        resolve(scoreInfoResult)
    }).catch()
}