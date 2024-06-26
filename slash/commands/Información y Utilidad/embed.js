const { Client, CommandInteraction, MessageEmbed, Discord } = require('discord.js');
const Command = require('../../../structures/command.js');

module.exports = class embed extends Command {
    constructor(client) {
       super(client, {
        name: 'embed',
        description: 'Sends a embed.',
        description_localizations: {
           'es-ES': 'Envía un embed.',
        },
        cooldown: 5,
        options: [
            {
              "type": 7,
              "name": "channel",
              "channel_types": ["0"],
              "name_localizations": {
                    "es-ES": "canal",
                },
              "description": "Channel where the embed will be sent.",
              "description_localizations": {
                    "es-ES": "Canal deseado para enviar el embed",
                },
              "required": true
            },
            {
                "type": 3,
                "name": "color",
                  "name_localizations": {
                      "es-ES": "color",
                  },
                "description": "Color of the embed",
                "description_localizations": {
                      "es-ES": "Color a elegir del embed.",
                  },
                "choices": [
                  {
                    "name": "Default",
                    "name_localizations": {
                          "es-ES": "Defecto",
                      },
                    "value": "default"
                  },
                  {
                    "name": "Aqua",
                    "name_localizations": {
                          "es-ES": "Agua",
                      },
                    "value": "aqua"
                  },
                  {
                    "name": "Dark Aqua",
                      "name_localizations": {
                          "es-ES": "Agua Oscuro",
                      },
                    "value": "DARK_AQUA"
                  },
                  {
                    "name": "Green",
                      "name_localizations": {
                          "es-ES": "Verde",
                      },
                    "value": "GREEN"
                  },
                  {
                    "name": "Dark Green",
                      "name_localizations": {
                          "es-ES": "Verde Oscuro",
                      },
                    "value": "DARK_GREEN"
                  },
                  {
                    "name": "Blue",
                      "name_localizations": {
                          "es-ES": "Azul",
                      },
                    "value": "BLUE"
                  },
                  {
                    "name": "Dark Blue",
                      "name_localizations": {
                          "es-ES": "Azul Oscuro",
                      },
                    "value": "DARK_BLUE"
                  },
                  {
                    "name": "Purple",
                      "name_localizations": {
                          "es-ES": "Morado",
                      },
                    "value": "PURPLE"
                  },
                  {
                    "name": "Dark Purple",
                      "name_localizations": {
                          "es-ES": "Morado Oscuro",
                      },
                    "value": "DARK_PURPLE"
                  },
                  {
                    "name": "Lumious Vivid Pink",
                      "name_localizations": {
                          "es-ES": "Rosa Brillante",
                      },
                    "value": "LUMINOUS_VIVID_PINK"
                  },
                  {
                    "name": "Dark Vivid Pink",
                      "name_localizations": {
                          "es-ES": "Rosa Brillante Oscuro",
                      },
                    "value": "DARK_VIVID_PINK"
                  },
                  {
                    "name": "Gold",
                      "name_localizations": {
                          "es-ES": "Oro",
                      },
                    "value": "GOLD"
                  },
                  {
                    "name": "Dark Gold",
                      "name_localizations": {
                          "es-ES": "Oro Oscuro",
                      },
                    "value": "DARK_GOLD"
                  },
                  {
                    "name": "Orange",
                      "name_localizations": {
                          "es-ES": "Naranja",
                      },
                    "value": "ORANGE"
                  },
                  {
                    "name": "Dark Orange",
                      "name_localizations": {
                          "es-ES": "Naranja Oscuro",
                      },
                    "value": "DARK_ORANGE"
                  },
                  {
                    "name": "Red",
                      "name_localizations": {
                          "es-ES": "Rojo",
                      },
                    "value": "RED"
                  },
                  {
                    "name": "Dark Red",
                      "name_localizations": {
                          "es-ES": "Rojo Oscuro",
                      },
                    "value": "DARK_RED"
                  },
                  {
                    "name": "Grey",
                      "name_localizations": {
                          "es-ES": "Gris",
                      },
                    "value": "GREY"
                  },
                  {
                    "name": "Dark Grey",
                      "name_localizations": {
                          "es-ES": "Gris Oscuro",
                      },
                    "value": "DARK_GREY"
                  },
                  {
                    "name": "Darker Grey",
                      "name_localizations": {
                          "es-ES": "Gris Oscuro",
                      },
                    "value": "DARKER_GREY"
                  },
                  {
                    "name": "Light Grey",
                      "name_localizations": {
                          "es-ES": "Gris Claro",
                      },
                    "value": "LIGHT_GREY"
                  },
                  {
                    "name": "Navy",
                      "name_localizations": {
                          "es-ES": "Azul Marino",
                      },
                    "value": "NAVY"
                  },
                  {
                    "name": "Dark Navy",
                      "name_localizations": {
                          "es-ES": "Azul Marino Oscuro",
                      },
                    "value": "DARK_NAVY"
                  },
                  {
                    "name": "Yellow",
                      "name_localizations": {
                          "es-ES": "Amarillo",
                      },
                    "value": "YELLOW"
                  }
                ],
                "required": true
              },
              {
                "type": 3,
                "name": "titulo",
                "name_localizations": {
                      "es-ES": "titulo",
                  },
                "description": "Title of the embed",
                "description_localizations": {
                      "es-ES": "Título del embed",
                  },
                "required": true
              },
            {
              "type": 3,
              "name": "descripcion",
              "name_localizations": {
                    "es-ES": "descripcion",
                },
              "description": "Description of the embed",
                "description_localizations": {
                    "es-ES": "Descripción del embed",
                },
              "required": true
            }
          ]
     });
    }
async run(client, interaction, args) {
    // try {
        if (!args[0]) {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[5])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        if (!args[1]) {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[1])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        if (!args[2]) {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[2])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        if (!args[3]) {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[3])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        let canal, descripcion, color, titulo;

        canal =
            interaction.guild.channels.cache.get(args[0]);
        descripcion = args[3];
        titulo = args[2];
        if (!canal || canal.type !== "GUILD_TEXT") {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[4])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        let colors = [
            "DEFAULT",
            "AQUA",
            "DARK_AQUA",
            "GREEN",
            "DARK_GREEN",
            "BLUE",
            "DARK_BLUE",
            "PURPLE",
            "DARK_PURPLE",
            "LUMINOUS_VIVID_PINK",
            "DARK_VIVID_PINK",
            "GOLD",
            "DARK_GOLD",
            "ORANGE",
            "DARK_ORANGE",
            "RED",
            "DARK_RED",
            "GREY",
            "DARK_GREY",
            "DARKER_GREY",
            "LIGHT_GREY",
            "NAVY",
            "DARK_NAVY",
            "YELLOW",
        ];
        for (let index in colors) {
            if (args[1].toUpperCase() == colors[index]) {
                color = colors[index];
            }
        }
        if (!color) {
            const errorembed = new MessageEmbed()
                .setColor("RED")
                .setTitle(client.language.ERROREMBED)
                .setDescription(client.language.CREATEEMBED[6])
                .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL())
                .setImage("https://i.postimg.cc/gj8NSLsy/embed-colors.png");
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
        var embed = new MessageEmbed()
            .setDescription(`${descripcion}`)
            .setColor(`${color}`);

        if (
            (titulo || titulo !== "null") &&
            titulo != "none" &&
            titulo != "ninguno" &&
            titulo != "no" &&
            titulo != "''" &&
            titulo != '""'
        ) {
            embed.setTitle(titulo);
        }
        if (!canal.permissionsFor(client.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS', 'VIEW_CHANNEL'])) {
            interaction.editReply({content: "No tengo los permisos \`SEND_MESSAGES\`, \`EMBED_LINKS\` ni \`VIEW_CHANNEL\`, que son necesarios para enviar el embed."})
            return
        };
        canal.send({ embeds: [embed] });
        interaction.editReply({ content: "Embed creado y enviado con éxito." });
    // } catch (e) {
    //     console.error(e);
    //     message.channel.send({
    //         embeds: [
    //             new Discord.MessageEmbed()
    //                 .setColor("RED")
    //                 .setTitle(client.language.ERROREMBED)
    //                 .setDescription(client.language.fatal_error)
    //                 .setFooter(message.author.username, message.author.avatarURL())
    //         ]
    //     });
    //     webhookClient.send(
    //         `Ha habido un error en **${message.guild.name} [ID Server: ${message.guild.id}] [ID Usuario: ${message.author.id}] [Owner: ${message.guild.ownerId}]**. Numero de usuarios: **${message.guild.memberCount}**\nMensaje: ${message.content}\n\nError: ${e}\n\n**------------------------------------**`
    //     );
    //     try {
    //         message.author
    //             .send(
    //                 "Oops... Ha ocurrido un eror con el comando ejecutado. Aunque ya he notificado a mis desarrolladores del problema, ¿te importaría ir a discord.gg/nodebot y dar más información?\n\nMuchísimas gracias rey <a:corazonmulticolor:836295982768586752>"
    //             )
    //             .catch(e);
    //     } catch (e) { }
    // }
 }
}