const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');
const client = new Client({
  'allowedMentions': {
    'parse': ["roles", 'users', "everyone"],
    'repliedUser': false
  },
  'intents': [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  'partials': [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});
require("dotenv").config();
require("colors");
const {
  slash,
  prefix
} = require(process.cwd() + "/functions/cmdErrorLogs.js");
client.config = require(process.cwd() + "/json/config.json");
;
client.embed = require(process.cwd() + '/json/embed.json');
client.emotes = require(process.cwd() + '/json/emojis.json');
;
client.slash_err = slash;
client.msg_err = prefix;
client.prefix = client.config.SETTINGS.PREFIX;
client.slashCommands = new Collection();
client.categories = new Collection();
client.cooldowns = new Collection();
client.buttons = new Collection();
client.aliases = new Collection();
client.events = new Collection();
module.exports = client;
["extraEvents", "slashCommand", "events", "antiCrash"].forEach(_0x3fc153 => {
  require("./handlers/" + _0x3fc153)(client);
});
client.login(process.env.TOKEN)["catch"](_0x44e606 => {
  console.log(_0x44e606.message.bold.red);
});