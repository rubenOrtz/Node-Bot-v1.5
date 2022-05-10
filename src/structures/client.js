require("dotenv").config();
const Logger = require("../utils/console");
const { Collection } = require("discord.js");
const archivo = require(".././lang/index.json");
const Discord = require("discord.js");
const fs = require("fs");
const language = fs
  .readFileSync(
    "src/lang/" + archivo.find((language) => language.default).archivo
  )
  .toString();

module.exports = class Client extends Discord.Client {
  constructor() {
    super({
      partials: ["MESSAGE", "CHANNEL", "REACTION"],
      intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGE_REACTIONS",
      ],
      allowedMentions: { parse: ["users", "roles"], repliedUser: true },
      messageCacheMaxSize: 50,
      messageCacheLifetime: 60,
      retryLimit: 2,
    });
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenu = new Collection();
    this.messages = new Collection();
    this.language = JSON.parse(language);
    this.snipes = new Map();
    this.logger = Logger;
    this.statcordSongs = 0;
    this.config = process.env;
    this.devs = [
      "817466918357172285",
      "155411408752869377",
      "655800380042641428",
    ];
  }
  async login(token = this.token) {
    if (!token) throw new Error("No hay Token");
    super.login(token);
  }
};
