const malodyapi = require('../elainaRebuild-integration/malodyapi.js')
const config = require('../elainaRebuild-config/config.json')
const Discord = require('discord.js')

function modeEmote(input) {
    return config.resource.malody_mode_emote[parseInt(input)]
}

module.exports.run = async (client, message, args) => {
    if (args.length < 1) {
        message.channel.send("I need your username")
        return
    }
    let username = args[0]
    let res = await malodyapi.getUserInfo({username: username}).catch(() => {
        message.channel.send("Can't find said user");
        return;
    })

    const embed = new Discord.MessageEmbed()
        .setColor("#00dd22")
        .setDescription("**Username: **" + res.username + "  /  **Gold**: " + res.gold + " / " + res.user_info.location)
        .setAuthor("Malody user recent plays (click here to view profile)", "", "https://m.mugzone.net/accounts/user/" + res.uid)
        .setFooter("Last login on " + res.time.last_login.toUTCString())
        .setThumbnail(res.avatar_link)
    
    for (var i = 0; i < res.recent_play.length; i++) {
        //cap at 5 to not get too spammy
        if (i >= 5) break;
        let mode_emote = client.emojis.cache.find(emote => emote.name === modeEmote(res.recent_play[i].mode_id));
        embed.addField(`${mode_emote}  ${res.recent_play[i].chart_string})`, 
            `${res.recent_play[i].judge} - ${res.recent_play[i].score} / ${res.recent_play[i].max_combo}x / ${res.recent_play[i].accuracy}% ` + ((res.recent_play[i].game_mod.length > 0)? " + " + res.recent_play[i].game_mod.join(", ") : "") + "\n" +
            `Played ${res.recent_play[i].time} [(Chart)](${res.recent_play[i].chart_link})`)
    }

    message.channel.send(embed)
}

module.exports.name = 'malodyrecent'
module.exports.aliases = ['mldrecent']
module.exports.isEnable = true