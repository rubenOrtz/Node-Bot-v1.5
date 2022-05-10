const Command = require('../../../structures/command.js')
const Discord = require('discord.js')
module.exports = class avatar extends Command {
    constructor(client) {
      super(client, {
        name: "avatar",
        description: "Send your avatar!",
        name_localizations: {
          "es-ES": "perfil",
          "en-US": "profile"
        },
        description_localizations: {
          "es-ES": "Envia tu foto de perfil o de otro usuario.",
          "en-US": "Send your avatar or the other user one!"
        },
        cooldown: 5,
        options: [
            {
                type: 6,
                name: "user",
                description: "The user to get the avatar of.",
                name_localizations: {
                "es-ES": "usuario",
                "en-US": "user"
                },
                description_localizations: {
                  "es-ES": "La foto de perfil del usuario que quieres ver.",
                  "en-US": "The user to get the avatar of. xD"
                }
            }
        ]
      });
    }
    async run(client, interaction, args) {
        let embed = new Discord.MessageEmbed();
        let member;
    if (args[0]) {
      member = await interaction.guild.members.fetch(args[0]).catch(e => { return })
    }
    if (args[0] && !member) {
      const errorembed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(client.language.ERROREMBED)
        .setDescription(client.language.AVATAR[1])
        .setFooter(message.author.username, message.author.avatarURL());
      return interaction.editReply({ embeds: [errorembed]});
    }
    if (!args[0]) {
        member = interaction.member;
      embed.setColor("00ff00");
      embed.setImage(
        member.user.displayAvatarURL({
          dynamic: true,
          size: 4096,
        })
      );
      interaction.editReply({ embeds: [embed] });
    } else {
        embed.setFooter(`Aqui tienes el avatar de ${member.user.tag}!`);
        embed.setImage(
          member.user.displayAvatarURL({
            dynamic: true,
            size: 4096,
          })
        );
        embed.setColor("#00ff00");
        interaction.editReply({ embeds: [embed] });
    }
    }
}