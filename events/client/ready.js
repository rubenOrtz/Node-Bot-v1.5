const client = require("../../bot");
const CreateManager = require("../../utils/music/player")
const customCmdModel = require("../../models/customCmds");
const {
  REST
} = require('@discordjs/rest');
const {
  Routes
} = require('discord-api-types/v9');

client.once('ready', async () => {

  const cmds = await customCmdModel.find({});
  cmds.forEach(async (cmd) => {
    const guild = client.guilds.cache.get(cmd.guildId);

    guild?.commands.create({
      name: cmd.name,
      description: cmd.description,
    });
  });

  //    await customCommand.delete();
  // const command = await interaction.guild.commands.cache.find (
  // (cmd) => cmd.name
  // commandName
  // );
  // await interaction.guild.commands.delete(command.id);

  const rest = new REST({
    version: '9'
  }).setToken(process.env.token);
  (async () => {
    try {
      await rest.put(
        Routes.applicationCommands(client.user.id), {
          body: client.commands
        },
      );
      client.logger.debug('Application commands registrados correctamente.');
    } catch (error) {
      if (error) console.error(error);
    }
  })();

  client.logger.debug(`${client.user.username} ✅`)
  CreateManager(client).then(() => {
    client.on('raw', async (d) => {
      client.manager.updateVoiceState(d)
    })
  })
})