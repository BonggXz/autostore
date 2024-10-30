const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const Rate = require("../../schemas/rate");

module.exports = {
  name: "rate",
  description: "Check the current DL and WL rate.",
  usage: "",
  category: "",
  userPerms: [""],
  botPerms: [""],
  cooldown: 5,
  guildOnly: false,
  ownerOnly: true,
  toggleOff: false,
  nsfwOnly: false,
  maintenance: false,
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    try {
      const rate = await Rate.findOne();

      if (!rate) {
        const newRate = new Rate();
        await newRate.save();
        return interaction.reply({
          content: "Rate not found, default rates applied.",
          ephemeral: true,
        });
      }

      const rateEmbed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Current Rate")
        .setDescription("Here are the current rates for DL and WL:")
        .addFields(
          { name: "DL Rate", value: `\`${rate.DL}\``, inline: true },
          { name: "WL Rate", value: `\`${rate.WL}\``, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: "Rate Checker", iconURL: client.user.displayAvatarURL() });

      await interaction.reply({
        embeds: [rateEmbed],
        ephemeral: false,
      });
    } catch (error) {
      client.slash_err(client, interaction, error);
    }
  },
};