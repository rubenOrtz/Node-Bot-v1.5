const { Client, CommandInteraction, MessageEmbed, Discord } = require('discord.js');
const Command = require('../../../structures/command.js');
const moment = require("moment");
const osu = require("node-os-utils");
const os = require("os");
require("moment-duration-format");

module.exports = class status extends Command {
    constructor(client) {
       super(client, {
        name: 'status',
        description: 'Check the current bot status',
        name_localizations: {
           'es-ES': 'estado',
        },
        description_localizations: {
           'es-ES': 'Mira el estado actual del bot',
        },
        cooldown: 5,
     });
    }
    /**,
* @param {Client} client
* @param {CommandInteraction} interaction
* @param {String[]} args
*/
async run(client, interaction, args) {
    // try {
        const guildNum = await client.shard.fetchClientValues(
            "guilds.cache.size"
        );
        const memberNum = await client.shard.broadcastEval(client =>
            client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)
        );
        const totalMembers = memberNum.reduce(
            (prev, memberCount) => prev + memberCount,
            0
        );
        const totalGuilds = guildNum.reduce((total, shard) => total + shard, 0);
        var mem = osu.mem;
        let freeRAM;
        let usedRAM;
        mem.info()
        .then(info => {
            freeRAM = info["freeMemMb"]
            usedRAM = info["totalMemMb"] - freeRAM
        })
        const full = "▰";
        const empty = "▱";
        const diagramMaker = (used, free) => {
            const total = used + free;
            used = Math.round((used / total) * 10);
            free = Math.round((free / total) * 10);
            return full.repeat(used) + empty.repeat(free);
        };
        let cpuUsage;
        var cpu = osu.cpu;

        const p1 = cpu.usage().then((cpuPercentage) => {
            cpuUsage = cpuPercentage;
        });
        await Promise.all([p1]);

        const embed = new MessageEmbed()
            .setColor("#008822")
            .setAuthor(`${client.language.STATUS[1]} ${client.user.username}`)
            .setThumbnail( client.user.displayAvatarURL({ format: "png", dynamic: true, size: 4096, }) )
            .addField( "<:stats:863983092695302144> " + client.language.STATUS[3], "```" + `RAM: ${diagramMaker(usedRAM, freeRAM)} [${Math.round( (100 * usedRAM) / (usedRAM + freeRAM) )}%]\nCPU: ${diagramMaker(cpuUsage, 100 - cpuUsage)} [${Math.round( cpuUsage )}%]` + "```", false )
            .addField( "<:hdd:864126690342207499> " + client.language.STATUS[4], "```" + `${client.language.STATUS[5]}\n${client.language.STATUS[6]} ${( os.totalmem() / 1024 / 1024 / 1024 ).toFixed(2)} GB` + "```", false )
            .addField( "<:cmd:864107735255220235> " + client.language.STATUS[7], "```" + `${os.type} ${os.release} ${os.arch}` + "```", false )
            .addField( "<:membersblurple:863983092658208790> " + client.language.STATUS[8], "```" + `${totalMembers}` + "```" )
            .addField( "<:sticker:864103714971975691> " + client.language.STATUS[9], "```" + `${client.emojis.cache.size}` + "```", true )
            .addField( "<:members:864107765050638367> " + client.language.STATUS[10], "```" + `${totalGuilds}` + "```", true )
            .addField( "<:greendot:864163523331751956> " + client.language.STATUS[11], "```" + `${moment.duration(client.uptime) .format( `D [${client.language.STATUS[12]}], H [${client.language.STATUS[13]}], m [${client.language.STATUS[14]}], s [${client.language.STATUS[15]}]` )}` + "```", true )
            .addField( "<:greendot:864163523331751956> " + client.language.STATUS[16], "```" + `${moment.duration(os.uptime * 1000) .format( `D [${client.language.STATUS[12]}], H [${client.language.STATUS[13]}], m [${client.language.STATUS[14]}], s [${client.language.STATUS[15]}]` )}` + "```", true )
            .addField( "<a:engranajes:836295967569477682> " + client.language.STATUS[17], "```" + `${moment(client.readyAt).format("MMMM DD, YYYY HH:mm")}` + "```", true )
            .setColor("#2f3136");

        interaction.editReply({embeds: [embed]});
    // } catch (e) {
    //     console.error(e);
    //     console.error(e);
    //     message.channel.send({ embeds: [
    //         new Discord.MessageEmbed()
    //         .setColor("RED")
    //         .setTitle(client.language.ERROREMBED)
    //         .setDescription(client.language.fatal_error)
    //         .setFooter(message.author.username, message.author.avatarURL())
    //     ]});
    //     webhookClient.send(
    //         `Ha habido un error en **${message.guild.name} [ID Server: ${message.guild.id}] [ID Usuario: ${message.author.id}] [Owner: ${message.guild.ownerId}]**. Numero de usuarios: **${message.guild.memberCount}**\nMensaje: ${message.content}\n\nError: ${e}\n\n**------------------------------------**`
    //     );
    //     try {
    //         message.author
    //             .send(
    //                 "Oops... Ha ocurrido un eror con el comando ejecutado. Aunque ya he notificado a mis desarrolladores del problema, ¿te importaría ir a discord.gg/nodebot y dar más información?\n\nMuchísimas gracias rey <a:corazonmulticolor:836295982768586752>"
    //             )
    //             .catch(e);
    //     } catch (e) {}
    // }
 }
}