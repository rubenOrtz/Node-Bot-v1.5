const {
    Client,
    CommandInteraction,
    MessageEmbed
} = require('discord.js');
const Command = require('../../../structures/command.js')
module.exports = class ping extends Command {
    constructor(client) {
      super(client, {
        name: 'ping',
        description: 'Muestra la latencia del Bot.',
        cooldown: 5,
      });
    }
     async run(client, interaction, args) {
        let ping = Math.abs(interaction.createdTimestamp - Date.now())
        interaction.editReply({ embeds: [new MessageEmbed().setColor("GREEN").addField(`API`, `${interaction.client.ws.ping}ms`, true).addField(`Ping`, `${ping}ms`, true).setTitle('Ping').setTimestamp()]})
    }
}