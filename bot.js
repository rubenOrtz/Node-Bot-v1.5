require("dotenv").config();
const { Collection, Client, Intents } = require("discord.js");

const Node = require("./structures/client.js");
const client = new Node();

module.exports = client;

["index", "antiCrash", "events"].filter(Boolean).forEach((h) => {
  require(`./handler/${h}`)(client);
});
const fs = require("fs");
fs.readFile("./test.txt", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  if (data == "0") {
    require("./webhook.js");
  } else return;

  fs.writeFile("test.txt", "1", function (err) {
    if (err) {
      return console.log(err);
    }
  });
}); //

setInterval(() => {
  updateStatus();
}, 300000);

async function updateStatus() {
  const promises = [
    client.shard.fetchClientValues("guilds.cache.size"),
    client.shard.broadcastEval((c) =>
      c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    ),
  ];
  Promise.all(promises)
    .then((results) => {
      const guildNum = results[0].reduce(
        (acc, guildCount) => acc + guildCount,
        0
      );
      const memberNum = results[1].reduce(
        (acc, memberCount) => acc + memberCount,
        0
      );
      client.user.setActivity(
        `Servidores: ${guildNum} Miembros: ${memberNum}`,
        { type: "LISTENING" }
      );
    })
    .catch(console.error);
}

client.login(process.env.token); // Para solucionar el error de "No hay token"
