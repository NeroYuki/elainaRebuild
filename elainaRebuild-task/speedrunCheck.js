const request = require('request')
const unzipper = require('unzipper')
const { Readable } = require('stream');
const replayParser = require('../elainaRebuild-utils/replayParser.js');
const { run } = require('../elainaRebuild-cmd/ping.js');
const { getReplayFile } = require('../elainaRebuild-integration/osudroidapi.js');


async function replayEntriesFetch(input_url) {
    
    return new Promise((resolve, reject) => {
        let url = input_url
        let data_array = []
        request(url)
            .on('response', res => {
                if (res.statusCode != 200) {
                    log.errConsole("Non-200 status code")
                    reject()
                }
            })
            .on('data', chunk => data_array.push(Buffer.from(chunk)))
            .on('complete', () => {
                let result = Buffer.concat(data_array)
                //console.log(result)
                resolve(result)
            })
            .on('error', e => {
                log.errConsole(e)
                reject()
            })
    }).catch()
}

module.exports.check = async (entry_url, cat_info, cb) => {
    let zip_data = await replayEntriesFetch(entry_url)
    let res_code = 0;
    let run_results = []

    cat_info.maps.forEach((value) => {
        run_results.push({
            hash: value.hash,
            map_name: value.map_name,
            length: value.length,
            submit_time: -1,
            start_time: -1,
            play_time: -1.0
        })
    })

    function isSrank(replay_input) {
        if (replay_input.hit0 > 0) return false;
        let total_note = replay_input.hit300 + replay_input.hit300k + replay_input.hit100 + replay_input.hit100k + replay_input.hit50;
        if ((replay_input.hit300 + replay_input.hit300k) / total_note < 0.9) return false;
        if (replay_input.hit50 / total_note > 0.01) return false;
        return true;
    }


    const directory = await unzipper.Open.buffer(zip_data);
    //console.log('directory', directory);
    let done = 0;
    for (let x = 0; x < directory.files.length; x++) {
        let file = directory.files[x]
        if (file.path.endsWith('.odr')) {
            const content = await file.buffer();
            let replay_data = await replayParser.parse(content)
            for (let i = 0; i < run_results.length; i++) {
                
                if (replay_data.file_hash != run_results[i].hash) continue;
                if (!isSrank(replay_data)) continue;
                let play_time = run_results[i].length
                for (let j in replay_data.play_mod) {
                    let val = replay_data.play_mod[j].valueOf()
                    if (val == "MOD_DOUBLETIME") play_time /= 1.5
                    if (val == "MOD_HALFTIME") play_time /= 0.75
                }
                if (replay_data.force_speed != -1) play_time /= replay_data.force_speed
                if ((run_results[i].submit_time == -1 && run_results[i].play_time == -1.0) || (run_results[i].play_time != -1.0 && run_results[i].play_time > play_time)) {
                    run_results[i].submit_time = Number(replay_data.time)
                    run_results[i].play_time = play_time
                    run_results[i].start_time = run_results[i].submit_time - run_results[i].play_time
                }
            }    
        }
        console.log(x)
        if (x == directory.files.length - 1) {
            console.log("resolving")
            resolve()
        }
    }

    function resolve() {
        run_results.sort((a, b) => {return a.submit_time - b.submit_time})
        cb(run_results)
    }
}