module.exports.run = (client, message, args) => {
    message.channel.send("pong")
}

module.exports.name = 'ping'
module.exports.isEnable = true