const log = require('../elainaRebuild-utils/log.js')

module.exports = {
    name: 'ready',
    execute(client, args) {
        //console.log(args)
        log.toConsole("Bot is ready")
    }
};