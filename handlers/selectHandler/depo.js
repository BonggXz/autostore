const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const Depo = require("../../schemas/depo");
const schema = require("../../schemas/users");
const Rate = require("../../schemas/rate");

async function DepositInfo(interaction) {
  try {
    const depo = await Depo.findOne({});
    const rate = await Rate.findOne();
    const data = await schema.findOne({
      discordID: interaction.user.id,
    });

    if (!depo) {
      return interaction.reply({ content: "Owner Belum Meletakkan World Depo", ephemeral: true });
    }

    if (!rate) {
      const newRate = new Rate();
      await newRate.save();
      return interaction.reply({
        content: "Rate not found, default rates applied.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#313135")
          .setTitle('**DEPOSIT WORLD**')
          .setDescription(
            `- World: **${depo.world}**\n- Owner: **${depo.owner}**\n- Bot Name: **${depo.bot}**\n- Saweria Link: **${process.env.SAWERIA_LINK}**\n- Linktree Link: **${process.env.LINKTREE_LINK}**`
        )
        .setImage(process.env.STORE_BANNER)
        .setFooter({ text: `Note: This deposit is processed manually, not automatically. Please use Saweria or Trakteer for automatic deposits` })
        .setTimestamp(),
      ],
      ephemeral: true,
    });

  } catch (err) {
    await interaction.reply({
      content: "There was an error while executing this command...",
      ephemeral: true,
    });
    console.error(err)
  }
}


module.exports = { DepositInfo };