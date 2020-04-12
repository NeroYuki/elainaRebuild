const WebSocket = require('ws');
const zlib = require('zlib')
const log = require('../elainaRebuild-utils/log.js')

//this is not an api but more so a wrapper for estertion's score prober websocket, use with caution
//can't use apiParamBuilder because its a web socket server, not api, duh
//WARNING: this thing will be pretty slow, to ensure we won't murder the prober server

clear_list = ['Track Lost', 'Normal Clear', 'Full Recall', 'Pure Memory', 'Easy Clear', 'Hard Clear']
diff_list = ['PST', 'PRS', 'FTR']
//TODO: 34 character name goes here (in en)
character_list = []

function proberConnection(req, max_response) {
    return new Promise((resolve, reject) => {
        //create a socket
        const socket = new WebSocket('wss://arc.estertion.win:616');
        let resultObjects = []
        
        //on open, send the request
        socket.on('open', (event) => {
            log.toConsole('connection opened')
            socket.send(req)
        })

        //on message, process the data received
        socket.on('message', async (data) => {
            log.toConsole("Received a message from server")
            //if incoming data is a buffer, process it
            if (Buffer.isBuffer(data)) {
                let obj = await dataProcess(data)
                //log.toConsole(JSON.stringify(obj), "", "  ")
                if (obj.cmd !== "songtitle") resultObjects.push(obj)
            }
            //if server say bye, we say bye too
            else if (data === "bye") {
                log.toConsole("server have no more message to response, closing...")
                //waiting 2 seconds in case previous buffer is still being processed?
                setTimeout(() => { resolve(resultObjects) }, 2000)
            }
            //most likely server issue, retry if possible
            else if (data.startsWith("error")) {
                log.errConsole("Connection issue to server")
                resultObjects.unshift({cmd: 'retry'})
                resolve(resultObjects)
            }
            //if we gathered enough response, we should say bye
            if (resultObjects.length == max_response) {
                log.toConsole("gathered enough response, closing...")
                socket.terminate()
                resolve(resultObjects)
            }
        })

        //on closing, do nothing
        socket.on('close', () => {
            //nothing should be done here because everything should be resolve at on message event
            log.toConsole('connection to server closed')
        })

        //on error, just throw lol
        socket.on('err', (err) => {
            log.errConsole(err)
            reject()
        })
    }).catch()
}

function dataProcess(data) {
    return new Promise((resolve, reject) => {
        //decompress received data (please no error thanks)
        zlib.brotliDecompress(data, (err, decompressed_data) => {
            if (err) {
                log.errConsole(err)
                reject()
            }
            let result = {}
            // i swear decompressed data is weird, might want to try parse if you dont want it to straight up crashing
            try {
                result = JSON.parse(decompressed_data)
            }
            catch (err) {
                log.errConsole(err)
                reject()
            }
            resolve(result)
        })
    }).catch()
}

module.exports.lookupUser = (option) => {
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.username === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }
        req = "lookup " + option.username

        let connection_attempt = 1;
        let resultObjects = await proberConnection(req, 1)
        
        while (resultObjects[0].cmd == "retry" && connection_attempt <= 3) {
            log.toConsole('error in previous probing attempt, retrying...')
            connection_attempt += 1;
            resultObjects = await proberConnection(req, 1)
        } 

        if (resultObjects[0].cmd == "retry") {
            log.errConsole("Too many retry, will throw")
            reject()
        }
        
        if (resultObjects[0].cmd == "lookup_result") resolve(resultObjects[0].data)
        else {
            log.errConsole("malformed response, will throw")
            reject()
        }
    }).catch()
}

module.exports.getUserInfo = (option) => {
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.uid === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }
        let req = ""; let min_ptt = 3; let max_ptt = 4
        if (option.min_ptt !== undefined && !isNaN(option.min_ptt) && option.min_ptt > 0) min_ptt = option.min_ptt
        if (option.max_ptt !== undefined && !isNaN(option.max_ptt) && option.max_ptt <= 12) min_ptt = option.min_ptt
        req = option.uid + " " + min_ptt + " " + max_ptt

        log.toConsole(req)

        let connection_attempt = 1;
        let resultObjects = await proberConnection(req, 1)
        
        while (resultObjects[0].cmd == "retry" && connection_attempt <= 3) {
            log.toConsole('error in previous probing attempt, retrying...')
            connection_attempt += 1;
            resultObjects = await proberConnection(req, 1)
        } 

        if (resultObjects[0].cmd == "retry") {
            log.errConsole("Too many retry, will throw")
            reject()
        }

        if (resultObjects[0].cmd == "userinfo") {
            //TODO: beautify the output (replace field's value with coresponding string (clear_type, character, difficulty , song (in en)))
            resolve(resultObjects[0].data)
        }
        else {
            log.errConsole("malformed response, will throw")
            reject()
        }
    }).catch()
}

module.exports.getScoreInfo = (option) => {
    //WARNING: Extremely prone to disconnection, please avoid using this
    return new Promise(async (resolve, reject) => {
        if (option === undefined) {
            log.toConsole("No option is provided")
            reject()
        }
        if (option.uid === undefined) {
            log.errConsole("Insufficient option")
            reject()
        }
        //log.toConsole(JSON.stringify(option))
        let req = option.uid ; let max_req = 1; let min_ptt = 5; let max_ptt = 8
        if (option.min_ptt !== undefined && !isNaN(option.min_ptt) && option.min_ptt > 0) min_ptt = option.min_ptt
        if (option.max_ptt !== undefined && !isNaN(option.max_ptt) && option.max_ptt <= 12) max_ptt = option.max_ptt
        if (option.score_pull !== undefined && !isNaN(option.score_pull) && option.score_pull > 0 && option.score_pull <= 10) max_req = option.score_pull
        if (option.min_ptt > option.max_ptt) {
            let temp = option.min_ptt
            option.min_ptt = option.max_ptt
            option.max_ptt = temp
        }
        if (max_ptt - min_ptt <= 4) req += " " + min_ptt + " " + max_ptt
        log.toConsole(req)

        let connection_attempt = 1;
        let resultObjects = await proberConnection(req, 1 + max_req)
        
        while (resultObjects[0].cmd == "retry" && connection_attempt <= 3) {
            log.toConsole('error in previous probing attempt, retrying...')
            connection_attempt += 1;
            resultObjects = await proberConnection(req, 1 + max_req)
        } 

        if (resultObjects[0].cmd == "retry") {
            log.errConsole("Too many retry, will throw")
            reject()
        }

        let scoreData = []
        resultObjects.forEach((result_entry) => {
            //TODO: beautify the output (replace field's value with coresponding string (clear_type, character, difficulty , song (in en)))
            if (result_entry.cmd == "scores") scoreData.push(result_entry.data)
        })
        if (scoreData.length == 0) {
            log.errConsole("malformed response, will throw")
            reject()
        }
        resolve(scoreData)
    }).catch()
}

// module.export.getChartInfo = (option) => {}