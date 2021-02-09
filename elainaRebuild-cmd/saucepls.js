const sauceNAO = require("../elainaRebuild-integration/saucenaoapi.js")
const Discord = require('discord.js')

module.exports.run = (client, message, args) => {
    message.channel.messages.fetch({ limit: 50 })
    .then(async (messages) => {
        var image_url = "";
        if (messages.size == 0) return;
        messages.forEach((x) => {
            if (image_url != "") return;
            if (x.attachments.length == 0) return;
            x.attachments.forEach((ax) => {
                if (ax.url.endsWith(".jpg") || ax.url.endsWith(".png") || ax.url.endsWith(".jpeg")) {
                    image_url = ax.url;
                }
            })
        })
        if (image_url == "") {
            message.channel.send("Can't find any image in the last 50 messages")
        }
        else {
            let api_result = await sauceNAO.getsauce(image_url)
            if (api_result.message == -2) {
                message.channel.send("Failed to communicate with SauceNAO")
                return
            }
            else if (api_result.message == -1) {
                message.channel.send("Unknown error happened")
                return
            }
            else if (api_result.message == 0) {
                message.channel.send("Can't find sauce of this image")
                return
            }
            else if (api_result.message == 1) {
                let mirrorLink = ((api_result.danbooru_link != "")? "[danbooru](" + api_result.danbooru_link + ")\n" : "") + ((api_result.gelbooru_link != "")? "[gelbooru](" + api_result.gelbooru_link + ")" : "")
                const embed = {
                    "title": api_result.title,
                    "description": "Mirror:\n" + (mirrorLink ? mirrorLink : "Unknown"),
                    "url": api_result.pixiv_link,
                    "color": 3270124,
                    "thumbnail": {
                        "url": api_result.thumbnail
                    },
                    "author": {
                        "name":  "Artist:" + (api_result.artist)
                    },
                    "fields": [
                        {
                            "name": "From: " + api_result.material,
                            "value": (api_result.characters == "")? "Unknown" : api_result.characters
                        }
                    ]
                };
                message.channel.send({embed: embed})
            }
        }
    })
   
}

module.exports.name = 'saucepls'
module.exports.isEnable = true