const { Client, CommandInteraction, MessageEmbed, Discord } = require('discord.js');
const Command = require('../../../structures/command.js');
const axios = require("axios")

module.exports = class github extends Command {
    constructor(client) {
       super(client, {
        name: 'github',
        description: 'Show Information about a Github Account.',
        description_localizations: {
           'es-ES': 'Muestra información sobre una cuenta de Github.',
        },
        cooldown: 5,
        options: [{
           type: 3,
           name: 'account',
           description: 'Account to show information about.',
           name_localizations: {
              'es-ES': 'cuenta'
           },
           description_localizations: {
              'es-ES': 'Cuenta para mostrar la información.'
           },
           required: true
         }
        ]
     });
    }
    /**,
* @param {Client} client
* @param {CommandInteraction} interaction
* @param {String[]} args
*/
async run(client, interaction, args) {
   // try {
      if (!args[0]) {
        const errorembed = new MessageEmbed()
          .setColor("RED")
          .setTitle(client.language.ERROREMBED)
          .setDescription(client.language.INSTAGRAM[1])
          .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
        return interaction.editReply({embeds: [errorembed], ephimeral: true});
      }
      await interaction.editReply(client.language.TIKTOK[1]);
      let response, details;
      response = await axios
        .get(`https://api.github.com/users/${args[0]}`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            method: "GET",
            scheme: "https",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en,es-ES;q=0.9,es;q=0.8",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
          },
        })
        .catch((e) => {
          return interaction.editReply("Ese usuario no existe.");
        });
      const account = await response.data;
      if (!account) {
        const errorembed = new MessageEmbed()
          .setColor("RED")
          .setTitle(client.language.ERROREMBED)
          .setDescription(client.language.INSTAGRAM[13])
          .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
        return interaction.editReply({embeds: [errorembed]});
      }
      if (!account.id) {
        const errorembed = new MessageEmbed()
          .setColor("RED")
          .setTitle(client.language.ERROREMBED)
          .setDescription(client.language.INSTAGRAM[13])
          .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
        return interaction.editReply({embeds: [errorembed], ephimeral: true});
      }

      const embed2 = new MessageEmbed()
        .setDescription("")
        .setColor(process.env.EMBED_COLOR)
        .setThumbnail(account.avatar_url);
      if (account.name) embed2.addField(client.language.GITHUB[2].toString(), account.name.toString());
      if (account.type) embed2.addField(client.language.GITHUB[3].toString(), account.type.toString());
      if (account.company) embed2.addField(client.language.GITHUB[4].toString(), account.company.toString());
      if (account.blog) embed2.addField(client.language.GITHUB[5].toString(), account.blog.toString());
      if (account.location) embed2.addField(client.language.GITHUB[6].toString(), account.location.toString());
      if (account.email) embed2.addField(client.language.GITHUB[7].toString(), account.email.toString());
      if (account.bio) embed2.addField(client.language.GITHUB[8].toString(), account.bio.toString());
      if (account.twitter_username) embed2.addField(client.language.GITHUB[9].toString(), account.twitter_username.toString());
      if (account.public_repos) embed2.addField(client.language.GITHUB[10].toString(), account.public_repos.toString());
      if (account.followers) embed2.addField(client.language.GITHUB[11].toString(), account.followers.toString());

      interaction.editReply({content: ' ', embeds: [embed2]});
   //  } catch (e) {
   //    console.log(e)
   //    webhookClient.send(
   //      `Ha habido un error en **${message.guild.name} [ID Server: ${message.guild.id}] [Owner: ${message.guild.ownerId}]**. Numero de usuarios: **${message.guild.memberCount}** \n Message: ${message.content}\n\nError: ${e}\n\n**------------------------------------**`
   //    );
   //  }
  }
};

function formatNumber(parameter) {
  if (parameter.toString().length >= 7) {
    return parameter.toString() / 1000000 + "M";
  } else if (parameter.toString().length >= 5) {
    return parameter.toString() / 1000 + "K";
  } else {
    return parameter.toString();
  }
}
