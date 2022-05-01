const Command = require('../../../structures/command.js')

module.exports = class reboot extends Command {
    constructor(client) {
        super(client, {
            name: 'reboot',
            description: "Reboot a shard or all shards.",
            permissions: {
                dev: true,
            },
            options: [{
                type: 3,
                name: 'choice',
                description: 'Choice to reboot all shards or a shard.',
                name_localizations: {
                   'es-ES': 'elección'
                },
                description_localizations: {
                   'es-ES': 'Reiniciar una o todas las shards.'
                },
                required: false,
                choices: [
                    {
                      "name": "all",
                      "value": "all"
                    },
                    {
                      "name": "shard",
                      "value": "shard"
                    }
                  ],
                  required: true
                },
                {
                  type: 10,
                  name: "shard",
                  description: "The Shard to reboot",
                  required: false
                }
            ]
        });
    }
    async run(client, interaction, args) {
        if (!interaction.options.getString('choice') || interaction.options.getString('choice') == 'all') {
            await interaction.editReply({content: 'Reiniciando todas las shards...', embeds: []});
            client.shard.send({ type: 'reboot', shard: 'all' });
        }
        else if (!interaction.options.getString('choice') || interaction.options.getString('choice') == 'shard') {
            await interaction.editReply({content:`Reinciando Shard ${interaction.options.getString('shard')}...`, embeds: []});
            client.shard.send({ type: 'reboot', shard: interaction.options.getNumber('shard') });
        }
        else {
            await ctx.sendMessage('Invalid argument. Please specify a shard or "all".');
        }
    }
};