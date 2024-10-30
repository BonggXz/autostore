const { EmbedBuilder, MessageManager } = require('discord.js');
require(`colors`)
module.exports.prefix = prefix;
module.exports.slash = slash;
// const emojis = require(`${process.cwd()}/json/emojis.json`);
function prefix (client, message, error) {
    console.log(String((error.stack).red))
    client.channels.cache.get(client.config.SETTINGS.ErrorChannel).send({
        embeds: [
            new EmbedBuilder()
                .setColor(`#00FFFF`)
                .setTitle(`${client.emotes.MESSAGE.x} Error System [MESSAGE COMMANDS]`)
                .setDescription(`_An error has occured_.\n\n**Error Code:** \`${error.name}\`\n**Error Message:** \`${error.message}\`\n**Stack:** \`\`\`yml\n${error.stack}\`\`\``)
                .setFooter({text: `Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB | CPU: ${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}% | Ping: ${Date.now() - message.createdTimestamp}ms`})
          .addFields([
            {name: "Guild", value: message.guild.name, inline: true},
            {name: "ID", value: message.guild.id, inline: true}
          ])
            ]
    });

    client.channels.cache.get(message.channel.id).send({
        embeds: [
            new EmbedBuilder()
                .setColor("#00FFAA")
                .setTitle(`${client.emotes.MESSAGE.x} _An error has occured_`)
                .setDescription('Try again later!')
            ]
        }).then(m => setTimeout(() => m.delete(), 6000));
}

function slash (client, interaction, error) {
    console.log(String((error.stack).red))
      client.channels.cache.get(interaction.channel.id).send({
        embeds: [
            new EmbedBuilder()
                .setColor("#00FFAA")
                .setTitle(`${client.emotes.MESSAGE.x} _An error has occured_`)
                .setDescription('Try again later!')
            ]
        }).then(m => setTimeout(() => m.delete(), 6000));
    client.channels.cache.get(client.config.SETTINGS.ErrorChannel).send({
        embeds: [
            new EmbedBuilder()
                .setColor("#00ffaa")
                .setTitle(`${client.emotes.MESSAGE.x} Error System [INTERACTION COMMANDS]`)
                .setDescription(`_An error has occured_.\n\n**Error Code:** \`${error.name}\`\n**Error Message:** \`${error.message}\`\n**Stack:** \`\`\`yml\n${error.stack}\`\`\``)
                .setFooter({text: `Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB | CPU: ${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}% | Ping: ${Date.now() - interaction.createdTimestamp}ms`})
          .addFields([
            {name: "Guild", value: interaction.guild.name, inline: true},
            {name: "ID", value: interaction.guild.id, inline: true}
          ])
            ]   
    });
}

