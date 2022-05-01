const fetch = require("node-fetch");
require("dotenv").config();
const getRandomPhrase = require('../../../../utils/getRandomPhrase')
module.exports = async function bot1missing(client, interaction, data, reqEndpoint) {
    let bot2Availability;
    let addToQueue2;
    await interaction.guild.members
        .fetch(process.env.bot2id)
        .then((member) => {
            member.voice.channel ?
                (bot2Availability = false) :
                (bot2Availability = true);
            if (member.voice.channel && member.voice.channel != interaction.member.voice.channel) bot2Availability = false;
            if (member.voice.channel && member.voice.channel == interaction.member.voice.channel) addToQueue2 = true;
        })
        .catch((e) => {
            bot2Availability = false;
        });

    if (bot2Availability || addToQueue2) {
        fetch(`http://localhost:${process.env.bot2Port}/api/v1/${reqEndpoint}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                },
            })
            .then((response) => response.json())
            .then((embed) => {
                interaction.editReply({
                    embeds: [embed]
                })
            })
            .catch(async () => {
                let bot3Availability;
                let addToQueue3;
                await interaction.guild.members
                    .fetch(process.env.bot3id)
                    .then((member) => {
                        member.voice.channel ? (bot3Availability = false) : (bot3Availability = true);
                        if (
                            member.voice.channel &&
                            member.voice.channel != interaction.member.voice.channel
                        )
                            bot3Availability = false;
                        if (member.voice.channel && member.voice.channel == interaction.member.voice.channel)
                            addToQueue3 = true;
                    })
                    .catch((e) => {
                        bot3Availability = false;
                    });

                if (bot3Availability || addToQueue3) {
                    fetch(`http://localhost:${process.env.bot3Port}/api/v1/${reqEndpoint}`, {
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: {
                                "Content-Type": "application/json"
                            },
                        })
                        .then((response) => response.json())
                        .then((embed) => {
                            interaction.editReply({
                                embeds: [embed]
                            });
                        });
                } else {
                    let bot4Availability;
                    let addToQueue4;
                    await interaction.guild.members
                        .fetch(process.env.bot4id)
                        .then((member) => {
                            member.voice.channel ?
                                (bot4Availability = false) :
                                (bot4Availability = true);
                            if (
                                member.voice.channel &&
                                member.voice.channel != interaction.member.voice.channel
                            )
                                bot4Availability = false;
                            if (member.voice.channel && member.voice.channel == interaction.member.voice.channel)
                                addToQueue4 = true;
                        })
                        .catch((e) => {
                            bot4Availability = false;
                        });

                    if (bot4Availability || addToQueue4) {
                        fetch(
                                `http://localhost:${process.env.bot4Port}/api/v1/${reqEndpoint}`, {
                                    method: "POST",
                                    body: JSON.stringify(data),
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                }
                            )
                            .then((response) => response.json())
                            .then((embed) => {
                                interaction.editReply({
                                    embeds: [embed]
                                });
                            });
                    }
                }
            })
    } else {
        let bot3Availability;
        let addToQueue3;
        await interaction.guild.members
            .fetch(process.env.bot3id)
            .then((member) => {
                member.voice.channel ? (bot3Availability = false) : (bot3Availability = true);
                if (
                    member.voice.channel &&
                    member.voice.channel != interaction.member.voice.channel
                )
                    bot3Availability = false;
                if (member.voice.channel && member.voice.channel == interaction.member.voice.channel)
                    addToQueue3 = true;
            })
            .catch((e) => {
                bot3Availability = false;
            });

        if (bot3Availability || addToQueue3) {
            fetch(`http://localhost:${process.env.bot3Port}/api/v1/${reqEndpoint}`, {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                })
                .then((response) => response.json())
                .then((embed) => {
                    interaction.editReply({
                        embeds: [embed]
                    });
                });
        } else {
            let bot4Availability;
            let addToQueue4;
            await interaction.guild.members
                .fetch(process.env.bot4id)
                .then((member) => {
                    member.voice.channel ?
                        (bot4Availability = false) :
                        (bot4Availability = true);
                    if (
                        member.voice.channel &&
                        member.voice.channel != interaction.member.voice.channel
                    )
                        bot4Availability = false;
                    if (member.voice.channel && member.voice.channel == interaction.member.voice.channel)
                        addToQueue4 = true;
                })
                .catch((e) => {
                    bot4Availability = false;
                });

            if (bot4Availability || addToQueue4) {
                fetch(
                        `http://localhost:${process.env.bot4Port}/api/v1/${reqEndpoint}`, {
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: {
                                "Content-Type": "application/json"
                            },
                        }
                    )
                    .then((response) => response.json())
                    .then((embed) => {
                        interaction.editReply({
                            embeds: [embed]
                        });
                    })
                    .catch(() => {
                        const errorembed = new MessageEmbed()
                            .setColor(15548997)
                            .setFooter(getRandomPhrase(client.language.INTERNALERROR), interaction.member.displayAvatarURL({
                                dynamic: true
                            }));
                        interaction.editReply({
                            embeds: [errorembed]
                        });
                    })

            }
        }
    }
}