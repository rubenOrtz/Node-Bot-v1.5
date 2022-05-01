const Logger = require("../utils/console");
const simplestDiscordWebhook = require('simplest-discord-webhook')
require('dotenv').config();
const {
    MessageEmbed
} = require('discord.js');
const webhookClient = new simplestDiscordWebhook(process.env.errorWebhookURL);
module.exports = client => {
    process.on('unhandledRejection',async(reason, p) => {
        Logger.warn(' [antiCrash] :: Unhandled Rejection/Catch');
        Logger.error(reason, p);
        const errorEmbed = new MessageEmbed()
            .setColor(15548997)
            .addField('Razón', '```' + reason + '```')
            .addField('Error', '```' + await p + '```')
        webhookClient.send(errorEmbed)
    });
    process.on("uncaughtException", (err, origin) => {
        Logger.warn(' [antiCrash] :: Uncaught Exception/Catch');
        Logger.error(err, origin);
        const errorEmbed = new MessageEmbed()
            .setColor(15548997)
            .addField('Origen', '```' + origin + '```')
            .addField('Error', '```' + p + '```')
        webhookClient.send(errorEmbed)
    })
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        Logger.warn(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
        Logger.error(err, origin);
        const errorEmbed = new MessageEmbed()
            .setColor(15548997)
            .addField('Origen', '```' + origin + '```')
            .addField('Error', '```' + p + '```')
        webhookClient.send(errorEmbed)
    });
    process.on('multipleResolves', (type, promise, reason) => {
        Logger.warn(' [antiCrash] :: Multiple Resolves');
        Logger.error(reason);
        const errorEmbed = new MessageEmbed()
            .setColor(15548997)
            .addField('Razón', '```' + reason + '```')
        webhookClient.send(errorEmbed)
    });
}