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

    //console.log(client.emojis)

    const embed = new Discord.MessageEmbed()
        .setColor("#00dd22")
        .setDescription("**Username: **" + res.username + "  /  **Gold**: " + res.gold + " / " + res.user_info.location)
        .setAuthor("Malody user profile (click here to view profile)", "", "https://m.mugzone.net/accounts/user/" + res.uid)
        .setFooter("Account created on " + res.time.registration_date.toUTCString())
        .setThumbnail(res.avatar_link)
    
    res.mode_info.forEach((mode) => {
        let mode_emote = client.emojis.cache.find(emote => emote.name === modeEmote(mode.mode_id));
        //log.toConsole(mode_emote)
        embed.addField(`${mode_emote}  ${mode.mode_name} / # ${mode.rank}`, 
            mode.exp + "exp / " + mode.play_count + " plays / " + mode.max_combo + "x / " + mode.avg_accuracy + "%")
    })

    message.channel.send(embed)
}

module.exports.name = 'malodyprofile'
module.exports.aliases = ['mldprofile', 'mldpf']
module.exports.isEnable = true