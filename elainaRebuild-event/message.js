const mainConfig = require('../elainaRebuild-config/config.json');
const log = require('../elainaRebuild-utils/log.js')

module.exports = {
    name: 'message',
    execute(client, message) {
        const [cmd, ...args] = message.content.trim().slice(mainConfig.prefix.length).split(/\s+/g);
        //console.log(args)
        const command = client.commands.get(cmd)
        if (command) {
            if (!command.isEnable) {
                message.channel.send("This command is disabled here")
                return;
            } 
            command.run(client, message, args)
        }
    }
};