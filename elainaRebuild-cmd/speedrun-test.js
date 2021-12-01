const log = require('../elainaRebuild-utils/log.js')
const task = require('../elainaRebuild-task/speedrunCheck.js')
const databaseInteraction = require('../elainaRebuild-data/databaseInteraction.js')
const Discord = require('discord.js')

function msTohms (ms) {
    if (typeof ms !== 'number' || Number.isNaN(ms)) {
      throw new TypeError('Expected a number')
    }
    var sign = ms < 0 ? '-' : ''
    var abs = Math.abs(ms)
    var h = Math.floor(abs / 3600000)
    var m = ('0' + Math.floor(abs / 60000) % 60).slice(-2)
    var s = ('0' + Math.floor(abs / 1000) % 60).slice(-2)
    var ms = ('00' + abs % 1000).slice(-3)
    return sign + h + ':' + m + ':' + s + '.' + ms
}

module.exports.run = async (client, message, args) => {
    // check if message have attachment
    //console.log(message)
    if (!args[0]) {
        message.channel.send("No category have been selected")
        return
    }
    let cat = args[0]
    let cat_res_array = await databaseInteraction.queryRecord('speedrun-cat', {name: cat})
    if (!cat_res_array[0]) {
        message.channel.send("Can't find category")
        return
    }
    let cat_res = cat_res_array[0]
    if (message.attachments.size > 0) {
        //console.log()
        let url = message.attachments.first().attachment
        task.check(url, cat_res, (result) => {
            //console.dir(result, {depth: null})
            let SGT = 0
            let isAccepted = true;
            let result_string = ""
            for (let j in result) {
                if (result[j].submit_time == -1) {
                    message.channel.send('One of the map have not been played, run is not accepted')
                    isAccepted = false;
                } 
                SGT += result[j].play_time
                result_string += `**${result[j].map_name}**
                ${msTohms(Math.round(result[j].submit_time - result[0].start_time))} - ${msTohms(Math.round(result[j].play_time))}\n`
            }
            let RTA = result[result.length - 1].submit_time - result[0].start_time
            let is_qualified_for_RTA = (RTA > SGT * 2)? false : true
            

            let final_result_string = `**RTA - ${(is_qualified_for_RTA) ? msTohms(RTA) : "N/A"} | SGT - ${msTohms(SGT)}**`
            if (!isAccepted) return
            const embed = new Discord.MessageEmbed()
                .setColor("#00dd22")
                .setAuthor("Speedrun Result (" + cat + ")")
                .addFields({
                    name: "Detail",
                    value: result_string
                })
                .addFields({
                    name: "Final Result " + ((is_qualified_for_RTA) ? "(Single Segment)" : "(Multi Segmented)"),
                    value: final_result_string
                })
            message.channel.send(embed)
        })
    }
}

module.exports.name = 'speedrun-test'
module.exports.isEnable = true