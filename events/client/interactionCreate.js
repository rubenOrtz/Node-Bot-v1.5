const client = require("../../bot");
const UserModel = require("../../models/user");
const customCmdModel = require("../../models/customCmds");
const { MessageEmbed } = require("discord.js");
const getRandomPhrase = require("../../utils/getRandomPhrase");

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    let desc =
      client.language.NODETHINKING[
        Math.floor(
          Math.random() *
            (Object.keys(client.language.NODETHINKING).length + 1) +
            1
        )
      ];
    if (!desc) desc = client.language.NODETHINKING[1];

    // const loadingEmbed = new MessageEmbed()
    //   .setColor(process.env.bot1Embed_Color)
    //   .setDescription(desc);

    // await interaction
    //   .reply({
    //     embeds: [loadingEmbed],
    //   })
    //   .catch((e) => {
    //     client.logger.error(e);
    //   });
    const cmd = client.commands.find(
      (cmd2) => cmd2.name === interaction.commandName
    );

    if (cmd) {
      client.logger.info(`Comando ${cmd.name} ejecutado`);

      const args = [];
      for (let option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {
          if (option.name) args.push(option.name);
          option.options?.forEach((x) => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }
      interaction.member = interaction.guild.members.cache.get(
        interaction.user.id
      );
      fetchUser(client);

      async function fetchUser(client2) {
        return await new Promise((resolve) => {
          client2.users.fetch(interaction.member.id).then(() => {
            UserModel.findOne({
              USERID: interaction.member.id.toString(),
            }).then(async (s, err) => {
              if (err) {
                client.err(err);
              }
              if (s) {
                s.COMMANDS_EXECUTED = s.COMMANDS_EXECUTED + 1;
                s.save().catch((err) => {
                  client.logger.error(err);
                });
              }
              if (!s) {
                client.logger.debug(interaction.member.id.toString());
                const user = new UserModel({
                  USERID: interaction.member.id.toString(),
                  LANG: "es_ES",
                  COMMANDS_EXECUTED: 0,
                  BANNED: false,
                  Roles: {
                    Developer: {
                      Enabled: false,
                      Date: null,
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
                });
                user.save().catch((err) => console.error(err));
                resolve(user);
              }
            });
          });
        });
      }

      const permissionsFlags = [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS_AND_STICKERS",
        "USE_APPLICATION_COMMANDS",
        "REQUEST_TO_SPEAK",
        "MANAGE_EVENTS",
        "MANAGE_THREADS",
        "CREATE_PUBLIC_THREADS",
        "CREATE_PRIVATE_THREADS",
        "USE_EXTERNAL_STICKERS",
        "SEND_MESSAGES_IN_THREADS",
        "USE_EMBEDDED_ACTIVITIES",
        "MODERATE_MEMBERS",
      ];

      if (cmd.userPerms && cmd.userPerms.length) {
        let invalidPermissionsFlags = [];
        for (const permission of cmd.userPerms) {
          if (!permissionsFlags.includes(permission)) {
            return client.logger.warn(`Invalid Permissions: ${permission}`);
          }
          if (!interaction.member.permissions.has(permission)) {
            invalidPermissionsFlags.push(permission);
          }
        }
        if (invalidPermissionsFlags.length) {
          const noPermissionEmbed = new MessageEmbed()
            .setColor(process.env.COLOR)
            .setTitle(`Permisos insuficientes.`)
            .setDescription(`No tienes permisos.`)
            .addField(
              `Permisos requeridos:`,
              `\`${invalidPermissionsFlags.join(" ")}\``
            )
            .setFooter({
              text: `${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();
          return interaction.reply({
            embeds: [noPermissionEmbed],
            ephemeral: true,
          });
        }
      }
      if (cmd.botPerms && cmd.botPerms.length) {
        let invalidmePermissionsFlags = [];
        for (const permission of cmd.botPerms) {
          if (!permissionsFlags.includes(permission)) {
            return client.logger.warn(`Invalid Permissions: ${permission}`);
          }
          if (!interaction.guild.me.permissions.has(permission)) {
            invalidmePermissionsFlags.push(permission);
          }
        }
        if (invalidmePermissionsFlags.length) {
          const noPermissionmeEmbed = new MessageEmbed()
            .setColor(process.env.COLOR)
            .setTitle(`Necesito permisos`)
            .setDescription(`No tengo suficientes permisos.`)
            .addField(
              `Necesito este permiso:`,
              `\`${invalidmePermissionsFlags.join(" ")}\``
            )
            .setFooter({
              text: `${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();
          return interaction.reply({
            embeds: [noPermissionmeEmbed],
            ephemeral: true,
          });
        }
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
        content: cmd.response,
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
