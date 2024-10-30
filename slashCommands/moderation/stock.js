const {
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getAllStocks, soldHistory } = require("../../handlers/handlerStock");
const { getButtonStatus } = require("../../functions/buttonStatus");
const SoldHistory = require("../../schemas/sold");
const Rate = require("../../schemas/rate");
const Discount = require("../../schemas/discount");

module.exports = {
  name: "stock",
  description: "Check bot's stock.",
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
  run: async (client, interaction) => {
    try {
      const channel = client.channels.cache.get(process.env.IDSTOCK);
      if (!channel) return;

      const allStocks = await getAllStocks();
      const soldout = await SoldHistory.findOne({});
      if (!soldout) {
        await SoldHistory.create({ sold: 0 });
        return;
      } else if (allStocks.length <= 0) {
        await interaction.reply("No stocks available.");
        return;
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("White")
              .setDescription(
                `Please go to channel <#${process.env.IDSTOCK}> to see realtime stock!`
              ),
          ],
          ephemeral: true,
        });

        const msg = await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("White")
              .setDescription(`Waiting sec....`),
          ],
        });

        setInterval(async () => {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("set_growid")
              .setLabel("Set Name")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(getButtonStatus() ? process.env.EMOJI_MAINTENANCE_BUTTON : process.env.SET_GROWID_EMOJI),

            new ButtonBuilder()
              .setCustomId("check_balance")
              .setLabel("Check Account Profile")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(getButtonStatus() ? process.env.EMOJI_MAINTENANCE_BUTTON : process.env.CHECK_BALANCE_EMOJI),

            new ButtonBuilder()
              .setCustomId("buy")
              .setLabel("Buy")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji( getButtonStatus() ? process.env.EMOJI_MAINTENANCE_BUTTON : process.env.BUY_EMOJI),

            new ButtonBuilder()
              .setCustomId("deposit")
              .setLabel("Deposit")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(getButtonStatus() ? process.env.EMOJI_MAINTENANCE_BUTTON : process.env.DEPOSIT_EMOJI)
          );

          const intervalSoldout = await soldHistory();
          const intervalStock = await getAllStocks();
          const timestamp = Math.floor(Date.now() / 1000);
          const ShopRdp = new EmbedBuilder()
            .setColor("#313135")
            .setTitle(`**REALTIME STOCK**`)
            .setDescription(
              `Last Update: <t:${timestamp}:R>\n**╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴**`
            )
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({
              text: `Last Update`,
            })
            .setImage(process.env.STORE_BANNER);

          const discounts = await Discount.find({ expiration: { $gt: new Date() } });

          for (const stock of intervalStock) {
            const rate = await Rate.findOne({});
            if (!rate) {
              rate.DL = 3800;
              rate.WL = 38;
              rate.save();
            }

            const DL = Math.floor((stock.harga % 10000) / 100);
            const BGL = Math.floor(stock.harga / 10000);
            const form = [
              BGL > 0 ? `${BGL} ${process.env.BGL}` : "",
              DL > 0 ? `${DL} ${process.env.DL}` : "",
              stock.harga % 100 > 0
                ? `${stock.harga % 100} ${process.env.WL}`
                : "",
            ]
              .filter(Boolean)
              .join(" & ");

            const stockEmoji =
              stock.count > 0
                ? `${stock.count}`
                : `No Stock`;

            let discountInfo = "";
            const discount = discounts.find(d => d.productCode === stock.code.toLowerCase());
            if (discount) {
              if (discount.type === "percentage") {
                discountInfo = `\n- **Discount: ${discount.value}% off**`;
              } else if (discount.type === "buyxgety") {
                discountInfo = `\n- **Promo: Buy ${discount.value.x} Get ${discount.value.y} Free**`;
              }
              discountInfo += `\n- **Expires: <t:${Math.floor(discount.expiration.getTime() / 1000)}:R>**`;
            }

            ShopRdp.addFields({
              name: `** ${stock.desc.toUpperCase()}**`,
              value: `- **Code : ${stock.code.toUpperCase()}**\n- **Stock: ${stockEmoji}**\n- **Price: ${form} | Rp. ${(
                stock.harga * rate.WL
              ).toLocaleString()} ${
                process.env.WALLET_EMOJI
              }**${discountInfo}\n**╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴**\n`,
              inline: true,
            });
          }

          ShopRdp.addFields({
            name: `** HOW TO BUY **`,
            value: `- Select Menu **Set Name**\n- Select Menu **Check Account Profile** To Check Your Profile\n- Select Menu **Deposit** To See Deposit Option\n- Select Menu **Buy** For Buying Product`,
          });

          msg.edit({ embeds: [ShopRdp], components: [row] });
        }, 10000);
      }
    } catch (error) {
      client.slash_err(client, interaction, error);
      console.error(error);
    }
  },
};