const mainConfig = require('../elainaRebuild-config/config.json');
const log = require('../elainaRebuild-utils/log.js')

module.exports = {
    name: 'message',
    execute(client, message) {
        if (!message.content.startsWith(mainConfig.prefix)) return;
        const [cmd, ...args] = message.content.trim().slice(mainConfig.prefix.length).split(/\s+/g);
        
        const command = client.commands.get(cmd)
        if (command) {
            command.run(client, message, args)
        }
    }
};