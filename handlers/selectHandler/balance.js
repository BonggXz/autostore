const schema = require("../../schemas/users");
const { getButtonStatus } = require("../../functions/buttonStatus");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

function format(x) {
  return [
    Math.floor(x / 10000) > 0 ? `${Math.floor(x / 10000)} ${process.env.BGL}` : '',
    Math.floor((x % 10000) / 100) > 0 ? `${Math.floor((x % 10000) / 100)} ${process.env.DL}` : '',
    (x % 100) > 0 ? `${x % 100} ${process.env.WL}` : ''
  ].filter(Boolean).join(' & ') || 'Nothing to show';
}


async function BalanceCheck(interaction) {
  try {
    const data = await schema.findOne({
      discordID: interaction.user.id,
    });
    if (!data) {
      const button = new ButtonBuilder()
        .setCustomId("setGrowID")
        .setLabel("Set GrowID")
        .setEmoji(getButtonStatus() ? process.env.EMOJI_MAINTENANCE_BUTTON : process.env.EMOJI_BOT_DEPO)
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(button);
      return interaction.reply({
        content: "The user with the GrowID you provided or tagged user was not found",
        components: [row],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#313135")
          .setTitle(` **${interaction.user.tag} Account Profile** `)
          .setDescription(
            `- Name: **${data.GrowID}**\n- Balance: **${format(data.totalLocks)}**\n- Balance Rupiah: **${(data.walletBalance || 0).toLocaleString().replace(/,/g, ".")}**\n- Total Deposit: **${format(data.totalDeposit)} | ${process.env.WALLET_EMOJI} Rp.${(data.totalWallet || 0).toLocaleString().replace(/,/g, ".")}**`
          )
          .setTimestamp(new Date())
          .setFooter({ text: `This is Your Balance ${interaction.user.tag}` }),
      ],
      ephemeral: true,
    });
  } catch (err) {
    await interaction.reply({
      content: "There was an error while executing this command...",
      ephemeral: true,
    });
    console.error(err);
  }
}

module.exports = { BalanceCheck };