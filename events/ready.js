const { version } = require('discord.js');
const mongoose = require("mongoose");
const client = require("..");
var AsciiTable = require("ascii-table");
var table = new AsciiTable();
table.setBorder("│", "─", "✥", "✥");
table.setTitle(`Bot is online!`);

client.on("ready", async () => {
    const activities = [
        { name: `${client.guilds.cache.size} Servers`, type: 2 }, // LISTENING
        { name: `${client.users.cache.size} Users`, type: 3 }, // WATCHING
    ];

    let i = 0;
    setInterval(() => {
        if(i >= activities.length) i = 0;
        client.user.setActivity(activities[i]);
        i++;
    }, 10000);

    setTimeout(() => {
        client.logger(`Logged in as ${client.user.tag}!`.cyan.bold);
    }, 2000);

    mongoose.set("strictQuery", false);
    mongoose
        .connect(client.config.CLIENT.MONGO_TOKEN)
        .then(() => {
            client.logger(`Connected Database`);
        })
        .catch((err) => {
            client.logger(err);
            client.logger("Failed to connect to the MongoDB Database");
        });

    table
        .addRow(`Bot`, client.user.tag)
        .addRow(`Guild(s)`, `${client.guilds.cache.size} Server(s)`)
        .addRow(
            `Member(s)`,
            `${client.guilds.cache
                .reduce((a, b) => a + b.memberCount, 0)
                .toLocaleString()} Members`
        )
        .addRow(`Prefix`, `${client.prefix}`)
        .addRow(`Discord.js`, `${version}`)
        .addRow(`Node.js`, `${process.version}`)
        .addRow(
            `Memory`,
            `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(
                process.memoryUsage().rss / 1024 / 1024
            ).toFixed(2)} MB`
        );

    setTimeout(() => {
        console.log(table.toString());
    }, 3000);
});