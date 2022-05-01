const client = require("../../bot");
const UserModel = require('../../models/user');
const customCmdModel = require("../../models/customCmds");
const {
    MessageEmbed
} = require('discord.js');
const getRandomPhrase = require("../../utils/getRandomPhrase");

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        let desc = client.language.NODETHINKING[Math.floor(Math.random() * (Object.keys(client.language.NODETHINKING).length + 1) + 1)]
        if (!desc) desc = client.language.NODETHINKING[1]

        const loadingEmbed = new MessageEmbed()
            .setColor(process.env.bot1Embed_Color)
            .setDescription(desc)

        await interaction.reply({
            embeds: [loadingEmbed],
            ephemeral: true
        });
        const cmd = client.commands.find(cmd2 => cmd2.name === interaction.commandName);

        if (cmd) {
            client.logger.silly(`Comando ${cmd.name} ejecutado por ${interaction.user.username}#${interaction.user.tag}`)

            const args = [];
            for (let option of interaction.options.data) {
                if (option.type === "SUB_COMMAND") {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }
            interaction.member = interaction.guild.members.cache.get(interaction.user.id);
            fetchUser(client)

            async function fetchUser(client2) {
                return await new Promise(resolve => {
                    client2.users.fetch(interaction.member.id).then(() => {
                        UserModel.findOne({
                            USERID: interaction.member.id.toString()
                        }).then(async (s, err) => {
                            if (err) {
                                client.err(err);
                            }
                            if (s) {
                                s.COMMANDS_EXECUTED = s.COMMANDS_EXECUTED + 1;
                                s.save().catch(err => {
                                    client.logger.error(err)
                                });
                            }
                            if (!s) {
                                client.logger.debug(interaction.member.id.toString())
                                const user = new UserModel({
                                    USERID: interaction.member.id.toString(),
                                    LANG: "es_ES",
                                    COMMANDS_EXECUTED: 0,
                                    BANNED: false,
                                    Roles: {
                                        Developer: {
                                            Enabled: false,
                                            Date: null
                                        },
                                        Tester: {
                                            Enabled: false,
                                            Date: null,
                                        },
                                    },
                                    // Interacciones: {
                                    //     Enviadas: {},
                                    //     Recibidas: {},
                                    // },
                                })
                                user.save().catch((err) => console.error(err));
                                resolve(user)
                            }
                        });
                    });
                })
            }

            cmd.run(client, interaction, args);
        } else {
            const cmd = await customCmdModel.findOne({
                guildId: interaction.guild.id,
                name: interaction.commandName,
            });

            if (!cmd)
                return interaction.editReply({
                    content: "No se encontró el comando",
                    ephemeral: true,
                });

            interaction.editReply({
                content: cmd.response
            });
        }
    } else if (interaction.isSelectMenu()) {
        const menu = client.selectMenu.get(interaction.customId);
        if (menu) menu.run(client, interaction);
    } else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (button) button.run(client, interaction);
    }
});