const { ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { toggleButtonStatus, getButtonStatus } = require('../../functions/buttonStatus');

module.exports = {
	name: "setmt",
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
        toggleButtonStatus();

        await interaction.reply({
            content: getButtonStatus() ? 'Maintenance Mode Disabled!' : 'Maintenance Mode Enabled!',
            ephemeral: true
        });

    } catch (error) {
            client.slash_err(client, interaction, error);
        }
	}
};