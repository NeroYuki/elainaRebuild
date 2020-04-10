const osudroidapi = require('../elainaRebuild-integration/osudroidapi.js')
const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
    if (args.length < 1) {
        message.channel.send("I need your username")
        return
    }
    var username = args[0]
    var res = await osudroidapi.getUserInfo({username: username})
    const embed = new Discord.MessageEmbed()
        .setColor("#00dd22")
        .setDescription("**Username: **" + res.username + "  /  **Rank**: " + res.scoreRank + " / " + res.location)
        .setAuthor("osu!droid profile (click here to view profile)", "", "http://ops.dgsrz.com/profile.php?uid=" + res.uid)
        .addFields({ 
            name: "Total Score: " + res.score.toLocaleString(), 
            value: "Play Count: " + res.playCount + "\n" + "Overall Accuracy: " + res.accuracy.toFixed(2) + "%"
        })
        .setThumbnail(res.avatarLink)
    
    message.channel.send(embed)
}

module.exports.name = 'droidprofile'
module.exports.aliases = ['dpf', 'droidpf']
module.exports.isEnable = true