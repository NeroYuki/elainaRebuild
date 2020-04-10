module.exports.run = (client, message, args) => {
    const sayMessage = args.join(" ");
	message.channel.send(sayMessage);
}

module.exports.name = 'say'
module.exports.isEnable = true