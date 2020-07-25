const osudroidapi = require('../elainaRebuild-integration/osudroidapi.js')
const Discord = require('discord.js')
//const mongodb = require('mongodb');
const databaseManager = require('../elainaRebuild-data/databaseconnection')

function statusread(status) {
	let code = 0;
	switch (status) {
		case "scheduled": code = 16776960; break;
		case "on-going": code = 65280; break;
		case "completed": code = 16711680; break;
	}
	return code;
}

function modValid(input, required) {
	input = input.trim();
	if (required == "nm") return input == "-";
	if (required == "hr") return input == "r";
	if (required == "hd") return input == "h";
	if (required == "ez") return input == "e";
	if (required == "dt") return (input == "d" || input == "hd");
	if (required == "fm") return ((input.includes("r") || input.includes("h") || input.includes("e"))&&(!(input.includes("d") || input.includes("t"))))
	else return true;
}

function modchar2string(mod) {
    var res = 0;
    if (mod.includes("e")) res += "Easy ";
    if (mod.includes("h")) res += "Hidden";
	if (mod.includes("r")) res += "HardRock";
	if (mod.includes("d")) res += "DoubleTime";
	if (mod.includes("c")) res += "NightCore";
	if (mod.includes("n")) res += "NoFail";
	if (mod.includes("t")) res += "HalfTime";
	return res;
}

function convertTimeDiff(playTime) {
	var timeDiff = Date.now() - playTime * 1000;
	return timeDiff;
}


function scoreCalc(score, maxscore, accuracy, misscount) {
	let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
	newscore = newscore - (misscount*0.003*newscore);
	return newscore;
}

module.exports.run = (client, message, args) => {
    if (!message.member.roles.cache.find(role => role.name == "Referee")) {
		message.channel.send("You don't have enough permission to use this :3");
		return;
	}
	let id = args[0];
	if (id) {
        let matchdb = databaseManager.getConnection().collection("matchinfo");
		let mapdb = databaseManager.getConnection().collection("mapinfo");
        let query = { matchid: id };
        let mapplay = [];
		matchdb.find(query).toArray(async function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				message.channel.send("Can't find the match");
			}
			else {
				let minTimeDiff = -1; let minTimeDiffPos = -1;
                var allScoreFetch = []
                var i = 0
				for (i = 0; i < res[0].player.length; i++) {
                    let user_entry = await osudroidapi.getUserInfo({uid: res[0].player[i][1], fullInfo: false})
                    let score_entry = user_entry.recentPlays[0]
                    console.log(convertTimeDiff(score_entry.date) )
                    //try to find the most recent play from all players
                    if (minTimeDiff == -1 || convertTimeDiff(score_entry.date) < minTimeDiff) {minTimeDiff = convertTimeDiff(score_entry.date); minTimeDiffPos = i;}
                        allScoreFetch.push(score_entry)
                    tryCalcScore()
                }

                //let mappick = "";
                function tryCalcScore() {
                    if (i < res[0].player.length - 1) return
                    console.log("All retrived");
                    console.log(allScoreFetch);
                    console.log(minTimeDiff + " " + minTimeDiffPos);
                    let poolid = id.split(".")[0];
                    let poolquery = { poolid: poolid }
                    mapdb.find(poolquery).toArray(function(err, poolres) {
                        if (err) throw err;
                        if (!poolres[0]) {
                            message.channel.send("Can't find the pool");
                            return
                        }
                        let mapfound = false
                        for (k in poolres[0].map)
                            if (allScoreFetch[minTimeDiffPos].hash == poolres[0].map[k][3]) {mapplay = poolres[0].map[k]; mapfound = true; break;}
                        if (mapfound) {
                            let pscore = [];
                            let t1score = 0; let t2score = 0;
                            let displayRes1 = ""; let displayRes2 = ""; let displayRes3 = ""; let color = 0;
                            for (m in allScoreFetch) {
                                //formular notScorev2 = score/maxscore*600000 + (acc^4)*400000 - misscount*(currentscore*0.002)
                                if (allScoreFetch[m].hash == mapplay[3] && modValid(allScoreFetch[m].mode, mapplay[0])) {
                                    //TODO: input score
                                    //		escape this nested hell (if false return)
                                    var temp_score = scoreCalc(parseInt(allScoreFetch[m].score), parseInt(mapplay[2]), parseFloat(allScoreFetch[m].accuracy / 1000), parseInt(allScoreFetch[m].miss))
                                    if (allScoreFetch[m].mode == "hd") temp_score = Math.round(temp_score/1.036);
                                    pscore.push(temp_score)
                                }
                                else {
                                    pscore.push(0)
                                }
                            }
                            for (n in pscore) {
                                if (n % 2 == 0) {
                                    t1score += pscore[n]
                                    if (pscore[n] == 0) displayRes1 += res[0].player[n][0] + " (N/A):\t0 - Failed\n"
                                    else displayRes1 += res[0].player[n][0] + " (" + modchar2string(allScoreFetch[n].mode) + "):\t" + Math.round(pscore[n]) + " - **" + allScoreFetch[n].mark +"** - " + allScoreFetch[n].accuracy / 1000 + "% - " + allScoreFetch[n].miss + " miss(es)\n"
                                }
                                else {
                                    t2score += pscore[n]
                                    if (pscore[n] == 0) displayRes2 += res[0].player[n][0] + " (N/A):\t0 - Failed\n"
                                    else displayRes2 += res[0].player[n][0] + " (" + modchar2string(allScoreFetch[n].mode) + "):\t" + Math.round(pscore[n]) + " - **" + allScoreFetch[n].mark +"** - " + allScoreFetch[n].accuracy / 1000 + "% - " + allScoreFetch[n].miss + " miss(es)\n"
                                }
                            }
                            t1score = Math.round(t1score);
                            t2score = Math.round(t2score);
                            if (t1score > t2score) {displayRes3 = "Red Team won by " + Math.abs(t1score - t2score); color = 16711680;}
                            else if (t1score < t2score) {displayRes3 = "Blue Team won by " + Math.abs(t1score - t2score); color = 262399;}
                            else displayRes3 = "It's a Draw";
                            var embed = {
                                "title": mapplay[1],
                                "color": color,
                                "thumbnail": {
                                    "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                                },
                                "author": {
                                    "name": res[0].name
                                },
                                "fields": [
                                    {
                                        "name": "Red Team: " + t1score,
                                        "value": displayRes1
                                    },
                                    {
                                        "name": "Blue Team: " + t2score,
                                        "value": displayRes2
                                    },
                                    {
                                        "name": "=================================",
                                        "value": "**" + displayRes3 + "**"
                                    }
                                ]
                            };
                            message.channel.send({ embed });
                            let name = res[0].name;
                            let t1name = res[0].team[0][0];
                            let t2name = res[0].team[1][0];
                            let t1win = res[0].team[0][1] + (t1score > t2score);
                            let t2win = res[0].team[1][1] + (t1score < t2score);
                            res[0].team[0][1] = t1win;
                            res[0].team[1][1] = t2win;
                            let result = res[0].result;
                            let status = statusread(res[0].status);
                            var embed = {
                                "title": name,
                                "color": 65280,
                                "fields": [
                                    {
                                        "name": t1name,
                                        "value": "**" + t1win + "**",
                                        "inline": true
                                    },
                                    {
                                        "name": t2name,
                                        "value": "**" + t2win + "**",
                                        "inline": true
                                    }
                                ]
                            };
                            message.channel.send({ embed });
                            for (p in pscore) result[p].push(pscore[p])
                            let update = {
                                $set: {
                                    status: "on-going",
                                    team: res[0].team,
                                    result: result
                                }
                            }
                            matchdb.updateOne(query, update, function(err, res) {
                                if (err) throw err;
                                console.log("match info updated");
                            });
                        }
                        else message.channel.send("Can't find the map");
                    })
                }
            }
        })
    }
}

module.exports.name = 'matchsubmit'
module.exports.isEnable = true