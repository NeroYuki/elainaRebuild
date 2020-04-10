const log = require('../elainaRebuild-utils/log.js')
const apiParamBuilder = require('../elainaRebuild-utils/apiParamBuilder.js')
const request = require('request')
require('dotenv').config({ path: 'elainaRebuild-config/.env' })

const API_ENDPOINT = 'http://ops.dgsrz.com/api'
const PROFILE_ENDPOINT = 'http://ops.dgsrz.com'

async function droidApiCall(param) {
    return new Promise((resolve, reject) => {
        let url = API_ENDPOINT + param.toString();
        request(url, {}, (err, res, body) => {
            if (err) {
                log.errConsole(err)
                reject()
            }
            if (res.statusCode != 200) {
                log.errConsole("Non 200 status code")
                reject()
            }
            try {
                data = body.split('<br>')
                resolve(data)
            }
            catch (err) {
                log.errConsole(err)
                reject()
            }
        })
    })
}

async function droidProfileCall(param) {
    return new Promise((resolve, reject) => {
        let url = PROFILE_ENDPOINT + param.toString();
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
            if (option.uid !== undefined) param.addParam("uid", option.uid)
            else if (option.username !== undefined) param.addParam("username", option.username)
            let result = await droidApiCall(param)
            //return 2 element: player info (seperated by spaces) and json string include rank and recent play
            let playerInfo = result[0].split(' ')
            if (playerInfo[0] !== "SUCCESS") {
                log.toConsole("User is not found in the database")
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
            let profileParam = new apiParamBuilder("profile.php")
            profileParam.addParam("uid", resultObject.uid)
            let profileObject = await droidProfileCall(profileParam)
            resultObject.avatarLink = profileObject.avatarLink
            resultObject.location = profileObject.location

            //return userInfo object
            resolve(resultObject)
        }
    })
}