const azurlaneapi = require('../elainaRebuild-integration/azurlaneapi.js')
const Discord = require('discord.js')

function status2emote(inp) {
    const available_status = {
        Normal: ":green_square:",
        Offline: ":black_large_square:",
        Busy: ":yellow_square:",
        Full: ":red_square:"
    }
    return available_status[inp]
}

module.exports.run = async (client, message, args) => {
    let option = {
        region: 'en'
    }
    if (args[0]) { option.region = args[0] } 

    let res = await azurlaneapi.serverStatus(option)

    let infoString = ""
    res.forEach((serverInfo) => {
        infoString += status2emote(serverInfo.state) + "  " + serverInfo.name + ((serverInfo.flag !== "Normal")? ` (${serverInfo.flag})` : "") + "\n"
    })

    const embed = new Discord.MessageEmbed()
        .setColor("#00dd22")
        .setDescription(infoString)
        .setAuthor("Azur Lane server status for " + option.region)
    
    message.channel.send(embed)
}

module.exports.name = 'azurlanestatus'
module.exports.aliases = ['azurstatus', 'alstatus']
module.exports.isEnable = true
