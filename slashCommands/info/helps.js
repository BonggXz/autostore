const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const os = require('os');
require('ms');
module.exports = {
	name: "help",
	description: "See all owner command",
  usage: "",
  category: "",
	userPerms: [""],
	botPerms: [""],
	cooldown: 30,
  guildOnly: false,
  ownerOnly: true,
  toggleOff: false,
  nsfwOnly: false,
  maintenance: false,
	type: ApplicationCommandType.ChatInput,
	run: async (client, interaction) => {
    try {     
        const infoEmbed = new EmbedBuilder()
        .setColor("White")
        .setDescription(`**${process.env.SERU} OWNER COMMAND:**

${process.env.TITIK} **/help** 
${process.env.TITIK} **/ping** 
${process.env.TITIK} **/stock** 
${process.env.TITIK} **/setmt** 
${process.env.TITIK} **/set user** 
${process.env.TITIK} **/send product** 
${process.env.TITIK} **/addstock**
${process.env.TITIK} **/remove balance**
${process.env.TITIK} **/give balance**
${process.env.TITIK} **/delete price**
${process.env.TITIK} **/add price** 
${process.env.TITIK} **/changeprice**
${process.env.TITIK} **/changename**
${process.env.TITIK} **/change world**
`) // Mapping the commands
        .setFooter({text: `Slash Command [/]`, iconURL: interaction.guild.iconURL()})
        .setTimestamp()


await interaction.reply({
  embeds: [infoEmbed],
});
    }catch (error) {
            client.slash_err(client, interaction, error);
        }
	}
};