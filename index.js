require("dotenv").config();
const Logger = require("./utils/console");
const fs = require("fs");
const ShardMessage = require("./events/client/shardMessage.js");
const Statcord = require("statcord.js");
const Sentry = require("@sentry/node");

// const {
//     ClusterManager
// } = require('discord.js-cluster');

const { ShardingManager } = require("discord.js");

const manager = new ShardingManager("./bot.js", {
  token: process.env.token,
  totalShards: "auto",
});
// const manager = new ClusterManager('./bot.js', {
//     token: process.env.TOKEN,
//     totalShards: "auto",
//     totalClusters: "auto",
//     mode: 'worker',
// });

fs.writeFile("test.txt", "0", function (err) {
  if (err) {
    return console.log(err);
  }
});
manager.on("shardCreate", (shard) => {
  Logger.debug(`Launched cluster ${shard.id}`);
  shard.on("message", (message) =>
    new ShardMessage(null, ShardMessage).run(shard, message, manager, Logger)
  );
});

// manager.on('shardCreate', cluster => Logger.debug(`Launched cluster ${cluster.id}`));

manager.spawn();
if (process.env.STATCORD_TOKEN && process.env.NODE_ENV != "development") {
  manager.statcord = new Statcord.ShardingClient({
    key: process.env.STATCORD_TOKEN,
    manager,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true,
  });

  manager.statcord.on("autopost-start", () => {
    Logger.log("Started autopost");
  });

  manager.statcord.on("post", (status) => {
    if (!status) return;
    else Logger.error(status);
  });
  manager.statcordHandlerRegistered = true;
  // manager.statcord.registerCustomFieldHandler(1, async (m) => {
  //   const players = await m.broadcastEval(c => c.manager.players.filter(p => p.playing).size);
  //   return players.reduce((a, b) => a + b, 0).toString();
  // });
  // manager.statcord.registerCustomFieldHandler(2, async (m) => {
  //   const songs = await m.broadcastEval(c => c.statcordSongs);
  //   m.broadcastEval(c => c.statcordSongs = 0);
  //   return songs.reduce((a, b) => a + b, 0).toString();
  // });
}
if (process.env.NODE_ENV != "development") {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: require("./package.json").version,
      tracesSampleRate: 0.5,
    });
    Logger.log("Connected to Sentry");
  } else Logger.warn("Sentry dsn missing.");
}
