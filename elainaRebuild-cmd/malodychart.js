const malodyapi = require('../elainaRebuild-integration/malodyapi.js')
const config = require('../elainaRebuild-config/config.json')
const Discord = require('discord.js')

function modeEmote(input) {
    return config.resource.malody_mode_emote[parseInt(input)]
}

function status2color(input) {
    const available_status = {
        Stable: "#00dd22",
        Beta: "#dddd00",
        Alpha: "dd2200"
    }
    return available_status[input]
}

module.exports.run = async (client, message, args) => {
    if (args.length < 1) {
        message.channel.send("I need a link to the chart first you know?")
        return
    }
    let a = args[0].split("/");
    cid = a[a.length-1]
    let res = await malodyapi.getChartInfo({chartid: cid}).catch(() => {
        message.channel.send("Can't find the map with given id");
        return;
    })

    const mode_emote = client.emojis.cache.find(emote => emote.name === modeEmote(res.mode_id))
    const footer_text = "Last update on " + res.last_update.toUTCString() + ((res.stabled_by.username === undefined)? "" : " - Stabled by " + res.stabled_by.username)

    const embed = new Discord.MessageEmbed()
        .setColor(status2color(res.status))
        .setDescription(`**${res.artist} - ${res.track_name}**\n${mode_emote}  ${res.chart_name} (${res.creator.username})`)
        .setAuthor("Malody chart info (click here to view page)", "", res.ref_link)
        .setFooter(`${footer_text}`)
        .setThumbnail(res.cover_link)
        .addField(`Length: ${res.length} - BPM: ${res.bpm}`,
            `:arrow_forward: ${res.play_data.play_count}    :+1: ${res.play_data.like}    :-1: ${res.play_data.dislike}`)

    message.channel.send(embed)
}

module.exports.name = 'malodychart'
module.exports.aliases = ['mldchart', 'mldc']
module.exports.isEnable = true