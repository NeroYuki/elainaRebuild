//import libraries (only required one)

const Discord = require ("discord.js");
const client = new Discord.Client();
const fs = require('fs'); 
const log = require('./elainaRebuild-utils/log.js')
const mainConfig = require('./elainaRebuild-config/config.json');
const DatabaseConnection = require('./elainaRebuild-data/databaseconnection.js')
require('dotenv').config({ path: 'elainaRebuild-config/.env' })

client.commands = new Discord.Collection();

//import event handlers

fs.readdir('./elainaRebuild-event/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let EventHandler = require(`./elainaRebuild-event/${file}`);

        log.toConsole(`${file} event loaded`)
        const event = EventHandler.name || file.split('.')[0]; // Get the exact name of the event from the eventFunction variable. If it's not given, the code just uses the name of the file as name of the event
		const emitter = (typeof EventHandler.emitter === 'string' ? client[EventHandler.emitter] : EventHandler.emitter) || client;
		// Try catch block to throw an error if the code in try{} doesn't work
		try {
			emitter['on'](event, (...args) => EventHandler.execute(client, ...args)); // Run the event using the above defined emitter (client)
		} catch (error) {
			log.errConsole(error.stack); // If there is an error, console log the error stack message
		}
    })
    client.login(process.env.DISCORD_TOKEN);
})

//import command handlers

fs.readdir('./elainaRebuild-cmd/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let commandHandler = require(`./elainaRebuild-cmd/${file}`);
        if (commandHandler.isEnable !== true) {
            log.toConsole(`(x) ${file} command is disable`)
            return
        }

        client.commands.set(commandHandler.name, commandHandler)
        log.toConsole(`${file} command loaded`)
    })
})

//connection to database

DatabaseConnection.initConnection();

