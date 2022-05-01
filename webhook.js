const express = require('express');
require('dotenv').config()
const app = express();
const PORT = process.env.bot1Port;
const {
    MessageEmbed,
    Discord
} = require('discord.js');


const cors = require('cors')

const client = require("./bot");

var helmet = require('helmet');
app.use(helmet(), express.json(), cors());

app.listen(
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)

app.get('', function (req, res) {
    res.sendStatus(200)
})

app.use((req, res, next) => {
    if (req.headers["authorization"] !== `${process.env.jwt}`) {
        res.sendStatus(401)
        return
    }
    next()
})

app.post('/api/v1/new_player', async (req, res) => {


    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {

        const {
            MessageEmbed,
            Discord,
            WebhookClient
        } = require('discord.js');

        function formatTime(ms) {
            const time = {
                d: 0,
                h: 0,
                m: 0,
                s: 0,
            };
            time.s = Math.floor(ms / 1000);
            time.m = Math.floor(time.s / 60);
            time.s %= 60;
            time.h = Math.floor(time.m / 60);
            time.m %= 60;
            time.d = Math.floor(time.h / 24);
            time.h %= 24;

            const res = [];
            for (const [k, v] of Object.entries(time)) {
                let first = false;
                if (v < 1 && !first) continue;

                res.push(v < 10 ? `0${v}` : `${v}`);
                first = true;
            }
            return res.join(":");
        }

        let sc = req_body[7].join(' ')
        if (!req_body[0]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.PLAY[1],
                    iconURL: req_body[3]
                }, );
            return errorembed
        }
        let player
        try {
            player = client.manager.create({
                guild: req_body[4],
                voiceChannel: req_body[0]["channel"],
                textChannel: req_body[5],
                selfDeafen: true,
            })
        } catch (e) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.PLAY[14],
                    iconURL: req_body[3]
                });
            return errorembed
        }

        if (player.state !== "CONNECTED") {
            player.connect();
            player.setVolume(35)
        }

        const playerCanal = client.channels.cache.get(player.voiceChannel);
        if (!playerCanal) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.PLAY[1],
                    iconURL: req_body[3]
                });
            return errorembed
        }
        if (playerCanal.id != req_body[0]["channel"] && playerCanal.members.size == 1) {
            // let member = await interaction.guild.members.fetch(process.env.botID).catch(e => {
            //     return
            // });
            // member.voice.setChannel(req_body[0]["channel"]);
        } else if (playerCanal.id != req_body[0]["channel"]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.PLAY[2],
                    iconURL: req_body[3]
                });
            return errorembed
        }
        if (req_body[7][0].startsWith("https://open.spotify.com/")) {
            let res;
            res = await client.manager.search(sc || sc.url, req_body[6]);
            switch (res.loadType) {
                case "TRACK_LOADED": {
                    player.queue.add(res.tracks[0]);
                    const embed = await new MessageEmbed()
                        .setColor(process.env.bot1Embed_Color)
                        .setDescription(
                            `**${client.language.PLAY[3]}\n[${res.tracks[0].title}](${res.tracks[0].uri})**`
                        )
                        .setThumbnail(
                            `https://img.youtube.com/vi/${res.tracks[0].identifier}/maxresdefault.jpg`
                        )
                        .addField(client.language.PLAY[4], res.tracks[0].author, true)
                        .addField(
                            client.language.PLAY[5],
                            req_body[1] + "#" + req_body[2], req_body[3],
                            true
                        )
                        .addField(
                            client.language.PLAY[6],
                            formatTime(res.tracks[0].duration),
                            true
                        );
                    if (!player.playing && !player.paused && !player.queue.size)
                        player.play();
                    return embed
                }
                case "PLAYLIST_LOADED": {
                    const duration = formatTime(
                        res.tracks.reduce((acc, cur) => ({
                            duration: acc.duration + cur.duration,
                        })).duration
                    );
                    const embed = new MessageEmbed()
                        .setAuthor(req_body[1] + "#" + req_body[2], req_body[3])
                        .setColor(process.env.bot1Embed_Color)
                        .addField(client.language.PLAY[7], `${res.playlist.name}`, true)
                        .addField(
                            client.language.PLAY[8],
                            `\`${res.tracks.length}\``,
                            true
                        )
                        .addField(
                            client.language.PLAY[5],
                            `${req_body[1] + "#" + req_body[2], req_body[3]}`,
                            true
                        )
                        .addField(client.language.PLAY[6], `${duration}`, true)
                    player.queue.add(res.tracks);
                    if (
                        !player.playing &&
                        !player.paused &&
                        player.queue.totalSize === res.tracks.length
                    )
                        player.play();
                    return embed
                }
            }
        } else {
            let res;
            try {
                res = await client.manager.search(sc || sc.url, req_body[6]);
                if (res.loadType === "LOAD_FAILED") {
                    if (!player.queue.current) player.destroy();
                    const errorembed = new MessageEmbed()
                        .setColor(15548997)
                        .setFooter({
                            text: client.language.PLAY[9],
                            iconURL: req_body[3]
                        });
                    return errorembed
                }
            } catch (e) {
                return console.log(e);
            }
            switch (res.loadType) {
                case "NO_MATCHES":
                    if (!player.queue.current) player.destroy();
                    const errorembed = new MessageEmbed()
                        .setColor(15548997)
                        .setFooter({
                            text: client.language.PLAY[10],
                            iconURL: req_body[3]
                        });
                    return errorembed
                case "SEARCH_RESULT": {
                    const embed = await new MessageEmbed()
                        .setColor(process.env.bot1Embed_Color)
                        .setDescription(
                            `**${client.language.PLAY[3]}\n[${res.tracks[0].title}](${res.tracks[0].uri})**`
                        )


                        .setThumbnail(
                            `https://img.youtube.com/vi/${res.tracks[0].identifier}/maxresdefault.jpg`
                        )
                        .addField(client.language.PLAY[4], res.tracks[0].author, true)
                        .addField(
                            client.language.PLAY[5],
                            "<@" + res.tracks[0].requester.userId + ">",
                            true
                        )
                        .addField(
                            client.language.PLAY[6],
                            formatTime(res.tracks[0].duration),
                            true
                        );
                    player.queue.add(res.tracks[0]);
                    if (!player.playing && !player.queue.size && !player.paused)
                        player.play();
                    return embed
                }
                case "PLAYLIST_LOADED": {
                    player.queue.add(res.tracks);
                    const duration = formatTime(
                        res.tracks.reduce((acc, cur) => ({
                            duration: acc.duration + cur.duration,
                        })).duration
                    );
                    if (
                        !player.playing &&
                        !player.paused &&
                        player.queue.totalSize === res.tracks.length
                    )
                        player.play();
                    const e = new MessageEmbed()
                        .setTitle(client.language.PLAY[11])
                        .setColor(process.env.bot1Embed_Color)
                        .addField(client.language.PLAY[12], `${res.playlist.name}`, true)
                        .addField(
                            client.language.PLAY[13],
                            `\`${res.tracks.length}\``,
                            true
                        )
                        .addField(
                            client.language.PLAY[5],
                            `${req_body[1] + "#" + req_body[2], req_body[3]}`,
                            true
                        )
                        .addField(client.language.PLAY[6], `${duration}`, true)
                        .setImage(
                            `https://img.youtube.com/vi/${res.tracks[0].identifier}/maxresdefault.jpg`
                        );
                    return e
                }
                case "TRACK_LOADED": {
                    player.queue.add(res.tracks[0]);
                    const embed = await new MessageEmbed()
                        .setColor(process.env.bot1Embed_Color)
                        .setDescription(
                            `**${client.language.PLAY[3]}\n[${res.tracks[0].title}](${res.tracks[0].uri})**`
                        )
                        .setThumbnail(
                            `https://img.youtube.com/vi/${res.tracks[0].identifier}/maxresdefault.jpg`
                        )
                        .addField(client.language.PLAY[4], res.tracks[0].author, true)
                        .addField(
                            client.language.PLAY[5],
                            req_body[1] + "#" + req_body[2],
                            true
                        )
                        .addField(
                            client.language.PLAY[6],
                            formatTime(res.tracks[0].duration),
                            true
                        );
                    if (!player.playing && !player.paused && !player.queue.size)
                        player.play();
                    return embed
                }
            }
        }
    }, {
        shard: req.body[10],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/get_queue', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {

        const {
            MessageEmbed,
            Discord
        } = require('discord.js');
        const player = client.manager.players.get(req_body[3]);
        if (!player || !player.queue.current) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.QUEUE[1],
                    iconURL: req_body[2]
                })
            return errorembed
        }

        const {
            title,
            requester,
            uri
        } = player.queue.current;

        const {
            queue
        } = player;

        if (!player.queue[0]) {
            return new MessageEmbed()
                .setTitle(client.language.QUEUE[9])
                .setDescription(`🎧 ${client.language.QUEUE[3]}\n[${title}](${uri}) [<@${requester.userId}>]`)
                .setAuthor(`${client.language.QUEUE[6]} ${req_body[4]} ${client.language.QUEUE[7]}`, "https://i.imgur.com/CCqeomm.gif")
                .setColor(process.env.bot1Embed_Color)
        }

        let x;

        if (req_body[5] && req_body[5][1] > 1) {
            x = Math.floor(req_body[5][1]) * 10 + 1;
        } else {
            x = Math.floor(10);
        }
        let i;
        let j;
        if (req_body[5] && req_body[5][1] > 1) {
            i = x - 12;
            j = x - 11;
        } else {
            i = -1;
            j = 0;
        }

        let queuelist = player.queue
            .slice(x - 10, x)
            .map(
                () =>
                `**${++j}.** [${queue[++i].title}](${queue[i].uri}) [<@${
                    queue[i].requester.userId
                    }>]`
            )
            .join("\n");

        if (!queuelist) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.QUEUE[4],
                    iconURL: req_body[2]
                })
            return errorembed
        }
        const embed = new MessageEmbed();
        embed.setDescription(
            `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.userId}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
        );
        embed.setThumbnail(client.user.displayAvatarURL({
            dynamic: true
        }));
        embed.setAuthor(
            `${client.language.QUEUE[6]} ${req_body[4]} ${client.language.QUEUE[7]} (${Math.floor(x / 10)} / ${Math.floor(
                (player.queue.slice(1).length + 10) / 10
                )})`,
            "https://i.imgur.com/CCqeomm.gif"
        );
        embed.setFooter({
            text: `${client.language.QUEUE[5]} ${player.queue.length}`,
            iconURL: req_body[2]
        })
        embed.setColor(process.env.bot1Embed_Color)
        return embed

    }, {
        shard: req.body[8],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/skip_song', async (req, res) => {
    await client.shard.broadcastEval(async (c, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');
        const player = c.manager.players.get(req_body[0]);
        if (!player) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.SKIP[1][1],
                    iconURL: req_body[3]
                });

            return errorembed
        }
        if (player.voiceChannel != req_body[4]) return;
        if (player.trackRepeat) player.setTrackRepeat(false);
        if (player.queueRepeat) player.setQueueRepeat(false);

        if (!player.queue.current) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: client.language.RESUME[2],
                    iconURL: req_body[3]
                });
            return errorembed
        }

        if (player.voiceChannel) {
            if (
                player.voiceChannel != req_body[4]
            )
                return;
        }
        const {
            title
        } = player.queue.current;

        if (player) player.stop();
        const embed = new MessageEmbed()
            .setColor(process.env.bot1Embed_Color)
            .setTitle(c.language.SUCCESSEMBED)
            .setDescription(`${title} ${c.language.SKIP[4]}`)
            .setFooter({
                text: req_body[1] + "#" + req_body[2],
                iconURL: req_body[3]
            });
        return embed

    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/automix', async (req, res) => {
    await client.shard.broadcastEval(async (c, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');
        const sc = req_body[0][0];

        if (!req_body[4]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: c.language.AUTOMIX[1][1],
                    iconURL: req_body[3]
                });
            return errorembed
        }

        const player = c.manager.create({
            guild: req_body[5],
            voiceChannel: req_body[8]["channel"],
            textChannel: req_body[6],
            selfDeafen: true,
        });


        if (player.state !== "CONNECTED") {
            player.connect();
            player.setVolume(35)
        }

        const playerCanal = c.channels.cache.get(player.voiceChannel);
        if (!playerCanal) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: c.language.PLAY[1],
                    iconURL: req_body[3]
                });
            return errorembed
        }


        if (playerCanal && playerCanal.id && req_body[4] && playerCanal.id != req_body[4]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: c.language.PLAY[2],
                    iconURL: req_body[3]
                });
            return errorembed
        }

        let res;
        try {
            res = await c.manager.search(sc, req_body[7]);
            if (res.loadType === "LOAD_FAILED") {
                if (!player.queue.current) player.destroy();
            }
        } catch (e) {
            console.log(e)
        }
        let result = await c.manager.search(
            `https://www.youtube.com/watch?v=${res.tracks[0].identifier}&list=RD${res.tracks[0].identifier}&start_radio=1`,
            req_body[7]
        );
        switch (result.loadType) {
            case "NO_MATCHES":
                if (!player.queue.current) player.desroy();
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter({
                        text: c.language.AUTOMIX[3],
                        iconURL: req_body[3]
                    });
                return errorembed
            case "PLAYLIST_LOADED": {
                player.queue.add(result.tracks);
                if (
                    !player.playing &&
                    !player.paused &&
                    player.queue.totalSize === result.tracks.length
                )
                    player.play();
                const e = new MessageEmbed()
                    .setTitle(c.language.AUTOMIX[4])
                    .setColor(process.env.bot1Embed_Color)
                    .addField(
                        c.language.AUTOMIX[5],
                        `${result.playlist.name}`,
                        true
                    )
                    .addField(
                        c.language.AUTOMIX[6],
                        `\`${result.tracks.length}\``,
                        true
                    )
                    .addField(
                        c.language.AUTOMIX[7],
                        `<@${result.tracks[0].requester.userId}>`,
                        true
                    )
                    .setThumbnail(
                        `https://img.youtube.com/vi/${res.tracks[0].identifier}/maxresdefault.jpg`
                    );
                return e
            }
            case "LOAD_FAILED":
                const errorembed2 = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter({
                        text: c.language.AUTOMIX[3],
                        iconURL: req_body[3]
                    });
                return errorembed2
        }
        return embed




    }, {
        shard: req.body[9],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/247automix', async (req, res) => {
    await client.shard.broadcastEval(async (c, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');
        const sc = req_body[0][0];

        if (!req_body[4]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter({
                    text: c.language.AUTOMIX[1][1],
                    iconURL: req_body[3]
                });
            return errorembed
        }

        const player = c.manager.create({
            guild: req_body[5],
            voiceChannel: req_body[8]["channel"],
            textChannel: req_body[6],
            selfDeafen: true,
        });


        if (player.state !== "CONNECTED") {
            player.connect();
            player.setVolume(35)
        }


        let embed = await c.shard.broadcastEval((c, {
            voiceChannel
        }) => {
            const channel = c.channels.cache.get(voiceChannel)
            return channel;
        }, {
            shard: c.shard.id,
            context: {
                voiceChannel: player.voiceChannel
            }
        }).then(async channels => {
            let playerCanal = channels.find(c => c)
            if (!playerCanal) {
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(c.language.AUTOMIX[1][1], req_body[3]);
                return errorembed
            }


            if (playerCanal && playerCanal.id && req_body[4] && playerCanal.id != req_body[4]) {
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(c.language.PLAY[2], req_body[3]);
                return errorembed
            }

            let res;
            try {
                res = await c.manager.search(sc, req_body[7]);
                if (res.loadType === "LOAD_FAILED") {
                    if (!player.queue.current) player.destroy();
                }
            } catch (e) {
                console.log(e)
            }
            let result = await c.manager.search(
                `https://www.youtube.com/watch?v=${res.tracks[0].identifier}&list=RD${res.tracks[0].identifier}&start_radio=1`,
                req_body[7]
            );
            switch (result.loadType) {
                case "NO_MATCHES":
                    if (!player.queue.current) player.destroy();
                    const errorembed = new MessageEmbed()
                        .setColor(15548997)
                        .setFooter(c.language.AUTOMIX[3], req_body[3]);
                    return errorembed
                case "PLAYLIST_LOADED": {

                    result.tracks.shift()
                    let playlist = result.tracks.splice(1, 2)

                    player.queue.add(playlist);
                    if (
                        !player.playing &&
                        !player.paused &&
                        player.queue.totalSize === playlist.length
                    )
                        player.play();
                    const e = new MessageEmbed()
                        .setTitle(c.language["247AUTOMIX"][1])
                        .setColor(process.env.bot1Embed_Color)
                        .addField(
                            c.language.AUTOMIX[5],
                            `${playlist[0].title}`,
                            true
                        )
                        .addField(
                            c.language.AUTOMIX[6],
                            `\`${playlist.length}\``,
                            true
                        )
                        .addField(
                            c.language.AUTOMIX[7],
                            `<@${playlist[0].requester.userId}>`,
                            true
                        )
                        .setThumbnail(
                            `https://img.youtube.com/vi/${playlist[0].identifier}/maxresdefault.jpg`
                        );
                    return e
                }
                case "LOAD_FAILED":
                    const errorembed2 = new MessageEmbed()
                        .setColor(15548997)
                        .setFooter(c.language.AUTOMIX[3], req_body[3]);
                    return errorembed2
            }
        })
        return embed




    }, {
        shard: req.body[9],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/loop', async (req, res) => {
    await client.shard.broadcastEval(async (c, {
        req_body
    }) => {

        const {
            MessageEmbed,
            Discord
        } = require('discord.js');
        const player = c.manager.players.get(req_body[0]);
        if (!player) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(c.language.LOOP[5], req_body[5]);
            return errorembed
        }
        if (!req_body[1][0] || req_body[1][0].toLowerCase() == "song") {
            if (!player.trackRepeat) {
                player.setTrackRepeat(true);
                const embed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setDescription(c.language.LOOP[1])
                    .setTitle(`Loop`);
                return embed
            } else {
                player.setTrackRepeat(false);
                const embed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setDescription(c.language.LOOP[2])
                    .setTitle(`Loop`);
                return embed
            }
        } else if (req_body[1][0].toLowerCase() == "queue") {
            if (player.queueRepeat) {
                player.setQueueRepeat(false);
                const embed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setDescription(c.language.LOOP[3])
                    .setTitle(`Loop`);
                return embed
            } else {
                player.setQueueRepeat(true);
                const embed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setDescription(c.language.LOOP[4])
                    .setTitle(`Loop`);
                return embed
            }
        }


    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/now_playing', async (req, res) => {
    await client.shard.broadcastEval(async (c, {
        req_body
    }) => {

        const {
            MessageEmbed,
            Discord
        } = require('discord.js');

        const moment = require("moment");
        const momentDurationFormatSetup = require("moment-duration-format");
        momentDurationFormatSetup(moment);

        const player = c.manager.players.get(req_body[0]);
        if (!player) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(c.language.NOWPLAYING[2], req_body[3]);
            return errorembed
        }

        const {
            title,
            author,
            duration,
            requester,
            uri,
            identifier
        } =
        player.queue.current;
        const parsedCurrentDuration = moment
            .duration(player.position, "milliseconds")
            .format("mm:ss", {
                trim: false
            });
        const parsedDuration = moment
            .duration(duration, "milliseconds")
            .format("mm:ss", {
                trim: false
            });
        const part = Math.floor((player.position / duration) * 30);
        const uni = player.playing ? "▶" : "⏸️";
        const thumbnail = `https://img.youtube.com/vi/${identifier}/maxresdefault.jpg`;
        const user = `<@${requester.userId}>`;
        const embed = new MessageEmbed()
            .setColor(process.env.bot1Embed_Color)
            .setAuthor(
                player.playing ?
                c.language.NOWPLAYING[3] :
                c.language.NOWPLAYING[4],
                "https://i.imgur.com/CCqeomm.gif"
            )
            .setThumbnail(thumbnail)
            .setDescription(`**[${title}](${uri})**`)
            .addField(
                `${c.language.NOWPLAYING[7]} \`[${parsedDuration}]\``,
                `\`\`\`${uni} ${"─".repeat(part) + "⚪" + "─".repeat(30 - part)} ${parsedCurrentDuration}\`\`\``
            );
        if (author) embed.addField(c.language.NOWPLAYING[5], author, true)
        if (user) embed.addField(c.language.NOWPLAYING[6], user, true)
        return embed

    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/radio', async (req, res) => {
    let embed = await client.shard.broadcastEval(async (client, {
        req_body
    }) => {

        const player = client.manager.create({
            guild: req_body[1],
            voiceChannel: req_body[0]["channel"],
            textChannel: req_body[2],
            selfDeafen: true,
        });

        if (player.state !== "CONNECTED") {
            player.connect();
            player.setVolume(35)
        }

        let embed = await client.shard.broadcastEval((client, {
            voiceChannel
        }) => {
            const channel = client.channels.cache.get(voiceChannel)
            return channel;
        }, {
            shard: client.shard.id,
            context: {
                voiceChannel: player.voiceChannel
            }
        }).then(async channels => {

            const {
                MessageEmbed,
                Discord
            } = require('discord.js');

            function isUrl(s) {
                var regexp =
                    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                return regexp.test(s);
            };

            let playerCanal = channels.find(c => c)

            if (!playerCanal) {
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(client.language.PLAY[1], req_body[5]);
                return errorembed
            }
            if (playerCanal && playerCanal.id && req_body[6] && playerCanal.id != req_body[6]) {
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(client.language.PLAY[2], req_body[5]);
                return errorembed
            }
            const query = req_body[7].join(" ");
            if (!req_body[7][0]) {
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(client.language.RADIO[3], req_body[5]);
                return errorembed
            }
            let volume = 100;

            let filter = {
                limit: 1,
                by: "name",
                searchterm: query,
            };
            let str = "";
            let name = "";
            let favicon = "";
            let homepage = "";
            let codec = "";
            let bitrate = "";

            const {
                RadioBrowserApi,
                StationSearchType,
            } = require("radio-browser-api");
            const api = new RadioBrowserApi("NodeBot");

            let argumentos = [];
            try {

                await api
                    .getStationsBy(StationSearchType.byName, req_body[7].join(" "), 1)
                    .then((radio) => {
                        if (!radio[0]) {
                            const errorembed = new MessageEmbed()
                                .setColor(15548997)
                                .setFooter(client.language.RADIO[4] + ". " + client.language.RADIO[5], req_body[5]);
                            return errorembed
                        }
                        str = radio[0].urlResolved;
                        name = radio[0].name;
                        favicon = radio[0].favicon;
                        homepage = radio[0].homepage;
                        codec = radio[0].codec;
                        bitrate = radio[0].bitrate;
                    })
                    .catch((e) => {
                        console.log(e)
                        const errorembed = new MessageEmbed()
                            .setColor(15548997)
                            .setFooter(client.language.RADIO[11], req_body[5]);
                        const simplestDiscordWebhook = require('simplest-discord-webhook')
                        let webhookClient = new simplestDiscordWebhook(process.env.errorWebhookURL);
                        const errorembed2 = new MessageEmbed()
                            .setColor(15548997)
                            .setFooter("Error en el comando webhook.js (1)", client.user.displayAvatarURL({
                                dynamic: true
                            }));
                        webhookClient.send(errorembed2)
                        return errorembed
                    });

                let embed = await client.manager.search(str, req_body[8]).then(async (res) => {
                    switch (res.loadType) {
                        case "TRACK_LOADED":
                            player.queue.add(res.tracks[0]);
                            const embed = new MessageEmbed()
                                .setTitle(client.language.RADIO[12])
                                .setColor(process.env.bot1Embed_Color)
                                .addField(client.language.RADIO[6], `${name}`)
                                .addField(client.language.RADIO[9], `${codec}`, true)
                                .addField(client.language.RADIO[10], `${bitrate}`, true);
                            if (favicon && isUrl(favicon)) embed.setThumbnail(favicon);

                            if (homepage) embed.addField(
                                client.language.RADIO[7],
                                `${client.language.RADIO[8]}(${homepage})`,
                                true
                            )
                            if (!player.playing) {
                                player.play();
                                player.setVolume(volume || 50);
                                player.setTrackRepeat(false);
                                player.setQueueRepeat(false);
                            }
                            return embed
                        case "LOAD_FAILED":
                            const errorembed = new MessageEmbed()
                                .setColor(15548997)
                                .setFooter(client.language.RADIO[11], req_body[5]);
                            return errorembed
                    }
                })
                return embed
            } catch (e) {
                console.log(e)
                const errorembed = new MessageEmbed()
                    .setColor(15548997)
                    .setFooter(client.language.RADIO[11], req_body[5]);
                return errorembed

            }
        })
        return embed


    }, {
        shard: req.body[9],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
    return embed
});

app.post('/api/v1/shuffle', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');





        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor(15548997)
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }

        if (req_body[0] && player) {
            if (req_body[0] === player.voiceChannel) {
                player.queue.shuffle();
                const embed = new MessageEmbed()
                    .setColor(process.env.bot1Embed_Color)
                    .setTitle(client.language.SUCCESSEMBED)
                    .setDescription(
                        "🔀👍🏼"
                    )
                    .setFooter(req_body[3] + "#" + req_body[4], req_body[5]);
                return embed
                z
            }
        }




    }, {
        shard: req.body[3],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/seek', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');





        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }

        if (req_body[2][0] * 1000 >= player.queue.current.length || req_body[2][0] < 0) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.SEEK[3], req_body[5]);
            return errorembed
        }
        player.seek(req_body[2][0] * 1000);
        const embed = new MessageEmbed()
            .setColor(process.env.bot1Embed_Color)
            .setTitle(client.language.SUCCESSEMBED)
            .setDescription(
                `${client.language.SEEK[4]} ${req_body[2][0]}${client.language.SEEK[5]}`
            )
            .setFooter(req_body[3] + "#" + req_body[4], req_body[5]);
        return embed




    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/stop', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');





        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }
        player.destroy();
        const embed = new MessageEmbed()
            .setColor(process.env.bot1Embed_Color)
            .setTitle(client.language.SUCCESSEMBED)
            .setDescription(
                client.language.STOP[2]
            )
            .setFooter(req_body[3] + "#" + req_body[4], req_body[5]);
        return embed


    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/volume', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');

        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }

        let volemoji = "▬";
        let volamt;
        if (isNaN(req_body[2][0])) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.VOLUME[9], req_body[5]);
            return errorembed
        }

        if (req_body[2][0] < 0 || req_body[2][0] > 100) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setTitle(client.language.VOLUME[4]);
            return embed
        }
        let vol = Number(player.volume);
        if (vol == 0) {
            volamt = "🔇";
        } else if (vol > 0 && vol <= 10) {
            volamt = `${volemoji}`;
        } else if (vol > 10 && vol <= 20) {
            volamt = `${volemoji}` + `${volemoji}`;
        } else if (vol > 20 && vol <= 30) {
            volamt = `${volemoji}` + `${volemoji}` + `${volemoji}`;
        } else if (vol > 30 && vol <= 40) {
            volamt = `${volemoji}` + `${volemoji}` + `${volemoji}` + `${volemoji}`;
        } else if (vol > 40 && vol <= 50) {
            volamt =
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}`;
        } else if (vol > 50 && vol <= 60) {
            volamt =
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}`;
        } else if (vol > 60 && vol <= 70) {
            volamt =
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}`;
        } else if (vol > 70 && vol <= 80) {
            volamt =
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}`;
        } else if (vol > 80 && vol <= 100) {
            volamt =
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}` +
                `${volemoji}`;
        }

        if (!req_body[2][0]) {
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setAuthor(client.language.VOLUME[5], client.user.displayAvatarURL({
                    dynamic: true
                }))
                .setTitle(client.language.VOLUME[6])
                .setDescription(`** 🔊${volamt} ${player.volume} %**`);
            return embed
        } else if (player.volume == Number(req_body[2][0])) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[5],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setTitle(`**ERROR**`)
                .setDescription(
                    `**${client.language.VOLUME[7]} __${Number(req_body[2][0])}__ %**`
                );
            return embed
        } else {
            player.setVolume(Number(req_body[2][0]));
            let vol = Number(player.volume);
            if (vol == 0) {
                volamt = "🔇";
            } else if (vol > 0 && vol <= 10) {
                volamt = `${volemoji}`;
            } else if (vol > 10 && vol <= 20) {
                volamt = `${volemoji}` + `${volemoji}`;
            } else if (vol > 20 && vol <= 30) {
                volamt = `${volemoji}` + `${volemoji}` + `${volemoji}`;
            } else if (vol > 30 && vol <= 40) {
                volamt =
                    `${volemoji}` + `${volemoji}` + `${volemoji}` + `${volemoji}`;
            } else if (vol > 40 && vol <= 50) {
                volamt =
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}`;
            } else if (vol > 50 && vol <= 60) {
                volamt =
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}`;
            } else if (vol > 60 && vol <= 70) {
                volamt =
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}`;
            } else if (vol > 70 && vol <= 80) {
                volamt =
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}`;
            } else if (vol > 80 && vol <= 100) {
                volamt =
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}` +
                    `${volemoji}`;
            }

            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setAuthor(client.language.VOLUME[8], client.user.displayAvatarURL({
                    dynamic: true
                }))
                .setTitle(`** 🔊${volamt} ${player.volume} %**`);
            return embed
        }

    }, {
        shard: req.body[6],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/pause', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');

        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }

        if (player.paused) {
            player.pause(false);
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setDescription(client.language.PAUSE[2])
                .setFooter(req_body[2] + "#" + req_body[3], req_body[4]);
            return embed
        } else {
            player.pause(true);
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setDescription(client.language.PAUSE[1])
                .setFooter(req_body[2] + "#" + req_body[3], req_body[4]);
            return embed
        }

    }, {
        shard: req.body[5],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/resume', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');

        const player = client.manager.players.get(req_body[1]);
        if (!player) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setAuthor(
                    client.language.VOLUME[1],
                    "https://cdn.discordapp.com/emojis/717184163660300309.gif?v=1"
                )
                .setDescription(client.language.VOLUME[2]);
            return embed
        }

        if (player.paused) {
            player.pause(false);
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setDescription(client.language.RESUME[1])
                .setFooter(req_body[2] + "#" + req_body[3], req_body[4]);
            return embed
        } else {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.RESUME[2], req_body[4]);
            return errorembed

        }

    }, {
        shard: req.body[5],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});

app.post('/api/v1/247', async (req, res) => {
    await client.shard.broadcastEval(async (client, {
        req_body
    }) => {
        const {
            MessageEmbed,
            Discord
        } = require('discord.js');

        const player = client.manager.players.get(req_body[1])
        if (!req_body[0]["channel"]) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.PLAY[11], req_body[4]);
            return errorembed
        }

        if (!player) {

            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.SKIP[1][1], req_body[4]);
            return errorembed
        }
        if (!player.queue.current) {
            const errorembed = new MessageEmbed()
                .setColor(15548997)
                .setFooter(client.language.QUEUE[1], req_body[4]);
            return errorembed
        }

        if (player.stayInVc) {
            player.stayInVc = false
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setFooter(client.language["247DISABLED"], req_body[4]);
            return embed
        } else {
            player.stayInVc = true
            const embed = new MessageEmbed()
                .setColor(process.env.bot1Embed_Color)
                .setFooter(client.language["247ENABLED"], req_body[4]);
            return embed
        }

    }, {
        shard: req.body[5],
        context: {
            req_body: req.body
        }
    }).then((embed) => {
        res.status(200).send(embed)
    })
});