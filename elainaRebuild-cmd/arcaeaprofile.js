const arcaeaapi = require('../elainaRebuild-integration/arcaeaapi.js')
const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
    let option = {
        uid: undefined,
        username: undefined,
    }
    if (args[0].length == 9 && /\d{9}/.test(args[0])) option.uid = args[0]
    else {
        option.username = args[0]
        let lookupResult = await arcaeaapi.lookupUser(option)
        if (lookupResult.length == 0) log.errConsole("Can't find said player, perhaps try to use your user id")
        else option.uid = lookupResult[0].code
    }

    let res = await arcaeaapi.getUserInfo(option)
    const attachment = new Discord.MessageAttachment("./elainaRebuild-resource/arcaea_char_icon/" + res.character + "_icon.png", "character_icon.png")
    const embed = new Discord.MessageEmbed()
        .setColor("#00dd22")
        .setDescription("**Username: **" + res.name + " **( " + res.rating + " )**")
        .setAuthor("Arcaea user profile")
        .addFields({ 
            name: "Most Recent Score: " + res.recent_score[0].clear_type + " - " + res.recent_score[0].song_name.en + " [" + res.recent_score[0].difficulty + "]", 
            value: "Result: " + res.recent_score[0].score.toLocaleString() + " (" + res.recent_score[0].rating.toFixed(3) + ") - " 
                + res.recent_score[0].shiny_perfect_count + " / "
                + res.recent_score[0].perfect_count + " / "
                + res.recent_score[0].near_count + " / "
                + res.recent_score[0].miss_count + " \n"
                + "Played at " + res.recent_score[0].time_played.toUTCString()
        })
        .setFooter("Register Date: " + res.join_date.toUTCString())
        .setThumbnail("attachment://character_icon.png")
    message.channel.send({embed, files: [attachment]})
}

module.exports.name = 'arcaeaprofile'
module.exports.aliases = ['arpf', 'arcaeapf']
module.exports.isEnable = true