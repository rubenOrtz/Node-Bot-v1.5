const {
  Manager
} = require("erela.js");
const Discord = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
const Spotify = require("erela.js-spotify");
const fetch = require('node-fetch')
require('dotenv').config()
module.exports = async (client) => {
  try {
    function formatDuration(client, duration) {
      if (isNaN(duration) || typeof duration === "undefined") return "00:00";
      if (duration > 3600000000) return client.language.LIVE;
      return prettyMilliseconds(duration);
    }
    const clientID = process.env.clientIDSpotify
    const clientSecret = process.env.clientSecretSpotify

    client.manager = new Manager({
        nodes: [{
          host: process.env.IP,
          port: 2333,
          password: "youshallnotpass",
        }, ],
        autoPlay: true,
        plugins: [
          new Spotify({
            clientID,
            clientSecret,
          }),
        ],
        send(id, payload) {
          const guild = client.guilds.cache.get(id);
          if (guild) guild.shard.send(payload);
        },
      })
      .on("nodeConnect", (node) => {
        /*
        NODE.OPTIONS ={
            port: 2333,
            password: 'youshallnotpass',
            secure: false,
            retryAmount: 5,
            retryDelay: 30000,
            host: 'localhost',
            identifier: 'localhost'
          }
        */
        client.logger.debug(
          `Node ${node.options.identifier} connected, ${node.options.host}:${node.options.port}`
        );
      })
      .on("nodeError", (node, error) =>
        client.logger.error(
          `Node ${node.options.identifier} had an error: ${error.message}`
        )
      )
      .on("trackStart", async (player, track) => {
        if (!track) return;
        player.setVolume(75);

        const row = new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
          .setStyle("DANGER")
          .setLabel(client.language.PLAYER["stopMusic"])
          .setCustomId("stopMusic"),
          new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setLabel(client.language.PLAYER["pauseMusic"])
          .setCustomId("pauseMusic"),
          new Discord.MessageButton()
          .setStyle("PRIMARY")
          .setLabel(client.language.PLAYER["skipMusic"])
          .setCustomId("skipMusic"),
          new Discord.MessageButton()
          .setStyle("PRIMARY")
          .setLabel(client.language.PLAYER["queueMusic"])
          .setCustomId("queueMusic")
        );
        const embed = new Discord.MessageEmbed()
          .setDescription(
            `${client.language.PLAYING} **[${track.title}](${track.uri})** [${formatDuration(client, 
              track.duration
            )}] • <@${track.requester.userId}>`
          )
          .setColor(process.env.bot1Embed_Color)
          .setThumbnail(track.thumbnail);

        await client.shard
          .broadcastEval(
            (c, {
              voiceChannel
            }) => {
              const channel = c.channels.cache.get(voiceChannel);
              if (channel) {
                return channel.guild;
              }
            }, {
              context: {
                voiceChannel: player.textChannel,
                embed: embed,
                row: row,
              },
            }
          )
          .then(async (channel) => {
            const req = channel.find((res) => !!res) || null;
            await client.shard
              .broadcastEval(
                (c, {
                  voiceChannel,
                  embed,
                  row
                }) => {
                  const channel = c.channels.cache.get(voiceChannel);
                  if (channel) {
                    return channel.send({
                      embeds: [embed],
                      components: [row],
                    });
                  }
                }, {
                  shard: req.shardId,
                  context: {
                    voiceChannel: player.textChannel,
                    embed: embed,
                    row: row,
                  },
                }
              )
              .then((msg) => {
                player.msgID = msg.id;
              });
          });
      })
      .on("trackEnd", async (player, track) => {
        await client.shard
          .broadcastEval(
            (c, {
              voiceChannel
            }) => {
              const channel = c.channels.cache.get(voiceChannel);
              if (channel) {
                return channel.guild;
              }
            }, {
              context: {
                voiceChannel: player.textChannel,
              },
            }
          )
          .then(async (channel) => {
            const req = channel.find((res) => !!res) || null;
            await client.shard.broadcastEval(
              async (c, {
                voiceChannel,
                msgID,
                // textChannel
              }) => {
                const channel = c.channels.cache.get(voiceChannel);
                if (channel) {
                  return channel.messages.fetch(msgID).then((msg) => {
                    msg.delete();
                  });
                }
              }, {
                shard: req.shardId,
                context: {
                  voiceChannel: player.textChannel,
                  // textChannel: player.textChannel
                  msgID: player.msgID,
                },
              }
            );
          });
      })
      .on("queueEnd", async (player, track) => {
        if (!player.stayInVc) {
          await client.shard
            .broadcastEval(
              (c, {
                voiceChannel
              }) => {
                const channel = c.channels.cache.get(voiceChannel);
                if (channel) {
                  return channel.guild;
                }
              }, {
                context: {
                  voiceChannel: player.textChannel,
                },
              }
            )
            .then(async (channel) => {
              const req = channel.find((res) => !!res) || null;
              await client.shard.broadcastEval(async (c, {
                voiceChannel,
                msgID,
                textChannel
              }) => {
                const {
                  MessageEmbed
                } = require("discord.js");
                const channel = c.channels.cache.get(voiceChannel);

                let msg = await channel.messages.fetch(msgID);
                msg.edit({
                  components: []
                });

                const errorembed = new MessageEmbed()
                  .setColor(process.env.bot1Embed_Color)
                  .setDescription(c.language.NOQUEUE);
                if (c.channels.cache.get(textChannel))
                  c.channels.cache.get(textChannel).send({
                    embeds: [errorembed],
                  });
              }, {
                shard: req.shardId,
                context: {
                  textChannel: player.textChannel,
                  msgID: player.msgID,
                  voiceChannel: player.textChannel,
                },
              }).then(x => player.destroy());
            });
        } else {
          if (track) {

            const data = [];
            const guild = client.guilds.cache.get(track.requester.guildId);
            const member = guild.members.cache.get(track.requester.userId)

            data.push([track.title]);
            data.push(track.requester.username);
            data.push(member.user.discriminator);
            data.push(track.requester.displayAvatarURL);
            data.push(member.voice.channelId);
            data.push(track.requester.guildId);
            data.push(player.textChannel);
            data.push(member);
            data.push(member.voice);
            data.push(guild.shardId)

            fetch(`http://51.161.86.217:${process.env.bot1Port}/api/v1/247automix`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": process.env.jwt
                },
              }).then(response => response.json())
              .then(async (resEmbed) => {
                await client.shard
                  .broadcastEval(
                    (c, {
                      voiceChannel
                    }) => {
                      const channel = c.channels.cache.get(voiceChannel);
                      if (channel) {
                        return channel.guild;
                      }
                    }, {
                      context: {
                        voiceChannel: player.textChannel
                      },
                    }
                  )
                  .then(async (channel) => {
                    const req = channel.find((res) => !!res) || null;
                    await client.shard.broadcastEval(async (c, {
                      voiceChannel,
                      msgID,
                      textChannel,
                      resEmbed
                    }) => {
                      const {
                        MessageEmbed
                      } = require("discord.js");
                      const channel = c.channels.cache.get(voiceChannel);

                      let msg = await channel.messages.fetch(msgID);
                      msg.edit({
                        components: []
                      });

                      if (c.channels.cache.get(textChannel))
                        c.channels.cache.get(textChannel).send({
                          embeds: [resEmbed],
                        });
                    }, {
                      shard: req.shardId,
                      context: {
                        textChannel: player.textChannel,
                        msgID: player.msgID,
                        voiceChannel: player.textChannel,
                        resEmbed: resEmbed
                      },
                    })
                  });
              })
              .catch((e) => {
                const simplestDiscordWebhook = require('simplest-discord-webhook')
                let webhookClient = new simplestDiscordWebhook(process.env.errorWebhookURL);
                const {
                  MessageEmbed
                } = require('discord.js')
                const errorembed2 = new MessageEmbed()
                  .setColor(15548997)
                  .setFooter("Error en el player (1)", client.user.displayAvatarURL({
                    dynamic: true
                  }));
                webhookClient.send(errorembed2)
              })



          } else {
            await client.shard.broadcastEval(
                (c, {
                  voiceChannel
                }) => {
                  const channel = c.channels.cache.get(voiceChannel);
                  if (channel) {
                    return channel.guild;
                  }
                }, {
                  context: {
                    voiceChannel: player.textChannel,
                  },
                }
              )
              .then(async (channel) => {
                const req = channel.find((res) => !!res) || null;
                await client.shard.broadcastEval(async (c, {
                  voiceChannel,
                  msgID,
                  textChannel
                }) => {
                  const {
                    MessageEmbed
                  } = require("discord.js");
                  const channel = c.channels.cache.get(voiceChannel);

                  let msg = await channel.messages.fetch(msgID);
                  msg.edit({
                    components: []
                  });

                  const errorembed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setDescription(c.language.NOQUEUE);
                  if (c.channels.cache.get(textChannel))
                    c.channels.cache.get(textChannel).send({
                      embeds: [errorembed],
                    });
                }, {
                  shard: req.shardId,
                  context: {
                    textChannel: player.textChannel,
                    msgID: player.msgID,
                    voiceChannel: player.textChannel,
                  },
                }).then(x => player.destroy());
              })
          }
        }

      })
      .on("playerMove", async (player, currentChannel, newChannel) => {
        player.voiceChannel = newChannel;
        if (player.paused) return;
        setTimeout(() => {
          player.pause(true);
          setTimeout(() => {
            player.pause(false);
          }, client.ws.ping * 2);
        }, client.ws.ping * 2);
      });
    client.manager.init(client.user.id);
  } catch (e) {
    client.logger.error(e);
  }
};