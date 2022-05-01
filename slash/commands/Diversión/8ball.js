const {
   Client,
   CommandInteraction,
   MessageEmbed,
   Discord
} = require('discord.js');
const Command = require('../../../structures/command.js');

module.exports = class ball extends Command {
   constructor(client) {
      super(client, {
         name: 'ball',
         description: 'Ask the magic 8ball a question',
         name_localizations: {
            'es-ES': 'ball',
         },
         description_localizations: {
            'es-ES': 'Pregunta al poderoso 8ball una pregunta',
         },
         cooldown: 5,
         options: [{
            type: 3,
            name: 'question',
            description: 'The question to ask',
            name_localizations: {
               'es-ES': 'pregunta'
            },
            description_localizations: {
               'es-ES': 'La pregunta a preguntar'
            },
            required: true
         }]
      });
   }
   /**,
    * @param {Client} client
    * @param {CommandInteraction} interaction
    * @param {String[]} args
    */
   async run(client, interaction, args) {
      // try {
      let respuesta = client.language.QUESTIONBALL[4];
      let argumentos = args.join(" ");
      if (!argumentos.includes("?")) {
         const errorembed = new MessageEmbed()
            .setColor("RED")
            .setTitle(client.language.ERROREMBED)
            .setDescription(
               client.language.QUESTIONBALL[3]
            )
            .setFooter(interaction.member.user.username + "#" + interaction.member.user.discriminator, interaction.member.displayAvatarURL());
         return interaction.editReply({
            embeds: [errorembed]
         })
      }
      var random = respuesta[Math.floor(Math.random() * respuesta.length)]; //aqui decimos que va a elegir una respuesta random de el let respuesta
      const embed = new MessageEmbed() //definimos el embed
         .addField(client.language.QUESTIONBALL[1], `${args.join(" ")}`) //primer valor decimos a su pregunta y en el segundo valor va la pregunta que iso el usuario
         .addField(client.language.QUESTIONBALL[2], `${random}`) //primer valor decimos "Mi respuesta" y en el segundo decimos que va a agarrar el var random
         .setColor("#008822"); //un color random
      interaction.editReply({
         embeds: [embed]
      }); //y que mande el embed
   }
}