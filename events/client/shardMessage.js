const Event = require('../../structures/event');
const {
    setTimeout: sleep
} = require('node:timers/promises');
const {
    isGeneratorFunction
} = require('node:util/types');

module.exports = class ShardMessage extends Event {
    constructor(...args) {
        super(...args);
    }

    async run(originShard, message, manager, Logger) {
        if (!originShard || !message) return;
        switch (message.type) {
            case 'reboot':
                switch (message.shard) {
                    case 'all':
                        Logger.warn('Reiniciando todas las shards');
                        respawnAll()
                        async function respawnAll({
                            shardDelay = 5_000,
                            respawnDelay = 500,
                            timeout = 30_000
                        } = {}) {
                            let s = 0;
                            for (const shard of manager.shards.values()) {
                                Logger.warn(`Reiniciando Shard ${shard.id}`);
                                const players = await manager.broadcastEval((c) => {
                                    return Promise.resolve(c.manager.players.map((player) => {

                                        /*
                                        current .....
                                        previous...
                                        {
                                            proxima 
                                        } 
                                        */
                                        const channel = c.channels.cache.get(player.options.textChannel)
                                        if (channel) {
                                            channel.send({
                                                content: c.language.REBOOTMESSAGE
                                            })
                                        } else {
                                            c.channels.fetch(player.options.textchannel).then((channel) => {
                                                channel.send({
                                                    content: c.language.REBOOTMESSAGE
                                                })
                                            })
                                        }
                                        return {
                                            options: player.options, //todo lo otro sale bien, es solo queue, porque es un Object
                                            queue: Object.values(player.queue), //  pero
                                            position: player.position
                                        }
                                    }))
                                }, {
                                    shard: shard.id
                                })
                                const promises = [await shard.respawn({
                                    delay: respawnDelay,
                                    timeout
                                })];
                                if (++s < manager.shards.size && shardDelay > 0) promises.push(sleep(shardDelay));
                                await Promise.all(promises).then(async () => {
                                    return await manager.broadcastEval(async (c, context) => {
                                        var interval3 = setInterval(async function () {
                                            if (c.manager) {
                                                clearInterval(interval3)
                                                return await Promise.resolve(
                                                    await c.manager.nodes.map((node) => {
                                                        var interval = setInterval(function () {
                                                            if (node.stats.uptime > 0) {
                                                                clearInterval(interval)
                                                                if (context !== []) {
                                                                    context.forEach(async (player2) => {
                                                                        const player = c.manager.create({
                                                                            guild: player2.options.guild,
                                                                            voiceChannel: player2.options.voiceChannel,
                                                                            textChannel: player2.options.textChannel,
                                                                            selfDeafen: true,
                                                                        });
                                                                        player.connect(node.id)
                                                                        let i = 0;
                                                                        player2.queue.reverse()
                                                                        player2.queue.shift()
                                                                        await Promise.all(player2.queue.map(async (track) => {
                                                                            if (!track || !track.title) return
                                                                            let uri = await c.manager.search(player2.queue[i].identifier, player2.queue[i].requester)
                                                                            i++
                                                                            return await player.queue.add(uri.tracks[0])
                                                                        })).then(() => {
                                                                            player.play()
                                                                        })
                                                                        var interval2 = setInterval(function () {
                                                                            if (player2.isStream || !player2.isSeekeable) clearInterval(interval2)
                                                                            if (player2.position > 0) {
                                                                                clearInterval(interval2)
                                                                                player.seek(player2.position)
                                                                            }
                                                                        }, 200)
                                                                    })
                                                                }
                                                            }
                                                        }, 200)
                                                    }))
                                            }
                                        }, 200)
                                    }, {
                                        shard: shard.id,
                                        context: await players

                                    })
                                }) // eslint-disable-line no-await-in-loop
                            }
                            return manager.shards;
                        }
                    case 'shard':
                        Logger.warn(`Reiniciando Shard ${message.shard}`);
                        // eslint-disable-next-line no-case-declarations
                        const shard = manager.shards.get(message.shard);
                        if (shard) shard.respawn();
                        break;
                }
                break;
            case 'statcord':
                if (!manager.statcord) return;
                if (manager.statcordHandlerRegistered) return;
                manager.statcordHandlerRegistered = true;
                switch (message.value) {
                    case 1:
                        manager.statcord.registerCustomFieldHandler(1, async (m) => {
                            const players = await m.broadcastEval(c => c.music.getPlayingPlayers().size);
                            return players.reduce((a, b) => a + b, 0).toString();
                        });
                        break;
                    case 2:
                        manager.statcord.registerCustomFieldHandler(2, async (m) => {
                            const songs = await m.broadcastEval(c => c.statcordSongs);
                            m.broadcastEval(c => c.statcordSongs = 0);
                            return songs.reduce((a, b) => a + b, 0).toString();
                        });
                        break;
                }
                break;
            default:
                // logger.error('Unknown message type: %s', message.type);
                break;
        }
    }
}