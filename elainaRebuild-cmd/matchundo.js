const databaseManager = require('../elainaRebuild-data/databaseconnection')

module.exports.run = (client, message, args) => {
    if (!message.member.roles.cache.find(role => role.name == "Referee")) {
		message.channel.send("You don't have enough permission to use this :3");
		return;
	}
	let id = args[0];
	if (id) {
		let matchdb = databaseManager.getConnection().collection("matchinfo");
		let query = { matchid: id };
		matchdb.find(query).toArray(function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				message.channel.send("Can't find the match");
			}
			else {
				if (err) throw err;
				let t1score = 0;
				let t2score = 0;
				let result = res[0].result
				if (!result[0]) {
					message.channel.send("No game have been played in this match");
					return;
				}
				for (i in result) {
					if (i % 2 == 0) t1score += result[i].pop();
					else t2score += result[i].pop();
				}
				res[0].team[0][1] -= (t1score > t2score);
				res[0].team[1][1] -= (t2score > t1score);
				var update = {
					$set: {
						team: res[0].team,
						result: result
					}
				}
				matchdb.updateOne(query, update, function(err, res) {
					if (err) throw err;
					message.channel.send("Match result reverted");
				});
			}
		});
	}
	else message.channel.send("Please specify match id");
	
}

module.exports.name = 'matchundo'
module.exports.isEnable = true