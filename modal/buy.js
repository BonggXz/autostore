const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { buyStock } = require("../handlers/handlerStock");
const Stocks = require("../schemas/stock");
const user = require("../schemas/users");
const History = require("../schemas/testimoni");
const SoldHistory = require("../schemas/sold");
const Rate = require("../schemas/rate");
const Discount = require("../schemas/discount");
const fs = require("fs");
const { getButtonStatus } = require("../functions/buttonStatus");

function buyModal() {
  const modal = new ModalBuilder()
    .setCustomId("buy_modal")
    .setTitle("BUYING PRODUCT");
  const codeInput = new TextInputBuilder()
    .setCustomId("code_input")
    .setLabel("Code Of Product")
    .setPlaceholder("Input Code Of Products Like You!")
    .setMinLength(1)
    .setMaxLength(10)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  const countInput = new TextInputBuilder()
    .setCustomId("count_input")
    .setLabel("Amount")
    .setPlaceholder("How Many You Want To Buy?")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(4)
    .setMinLength(1)
    .setValue("1")
    .setRequired(true);
  const buyTypeInput = new TextInputBuilder()
    .setCustomId("buy_type_input")
    .setLabel("What Do You Use Provider For Buy?")
    .setPlaceholder("Tunai or Locks")
    .setMaxLength(5)
    .setMinLength(5)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  const codeRow = new ActionRowBuilder().addComponents(codeInput);
  const countRow = new ActionRowBuilder().addComponents(countInput);
  const buyTypeRow = new ActionRowBuilder().addComponents(buyTypeInput);
  modal.addComponents(codeRow, countRow, buyTypeRow);
  return modal;
}

async function handleBuyModal(interaction) {
  if (interaction.customId === "buy_modal") {
    const codeResult = interaction.fields.getTextInputValue("code_input");
    const numberInput = interaction.fields.getTextInputValue("count_input");
    const buyTypeInput = interaction.fields.getTextInputValue("buy_type_input").toLowerCase();
    const countResult = parseInt(numberInput, 10);
    await interaction.deferReply({ ephemeral: true });
    const stock = await Stocks.findOne({ code: codeResult });
    const users = await user.findOne({ discordID: interaction.user.id });
    const rateData = await Rate.findOne({});

    if (isNaN(countResult) || countResult <= 0 || countResult.toString() !== numberInput) {
      await interaction.editReply({
        content: "Please enter a positive integer for the amount.",
        ephemeral: true,
      });
      return;
    }

    if (!stock) {
      await interaction.editReply({
        content: "Invalid product code.",
        ephemeral: true,
      });
      return;
    }

    const now = new Date();
    const discount = await Discount.findOne({
      productCode: codeResult,
      expiration: { $gt: now },
    });

    let finalCount = countResult;
    let discountDescription = "";
    let originalPrice = stock.harga;
    let discountedPrice = originalPrice;

    if (discount) {
      if (discount.type === "percentage") {
        const discountAmount = originalPrice * (discount.value / 100);
        discountedPrice = originalPrice - discountAmount;
        discountDescription = `${discount.value}% discount applied`;
      } else if (discount && discount.type === "buyxgety" && countResult > discount.value.x) {
        const { x, y } = discount.value;
        const sets = Math.floor(countResult / x);
        const bonusItems = sets * y;
        finalCount = countResult + bonusItems;
        discountDescription = `Buy ${x} Get ${y} discount applied. You're getting ${bonusItems} extra items!`;
      }
    }

    const totalPrice = buyTypeInput === "tunai"
      ? discountedPrice * rateData.WL * finalCount
      : discountedPrice * finalCount;

    if ((buyTypeInput === "tunai" && users.walletBalance < totalPrice) ||
      (buyTypeInput === "locks" && users.totalLocks < totalPrice)) {
      await interaction.editReply({
        content: `You don't have enough ${buyTypeInput === 'tunai' ? 'money' : 'locks'} to make this purchase.`,
        ephemeral: true,
      });
      return;
    }

    if (stock.data.length < countResult) {
      await interaction.editReply({
        content: `Not enough stock available for ${codeResult}.`,
        ephemeral: true,
      });
      return;
    }

    if (buyTypeInput === "tunai") {
      users.walletBalance -= totalPrice;
    } else if (buyTypeInput === "locks") {
      users.totalLocks -= totalPrice;
    } else {
      interaction.editReply({ content: "Invalid type, please choose 'tunai' or 'locks'", ephemeral: true });
      return;
    }

    await users.save();

    const boughtData = await buyStock(codeResult, finalCount);
    const filePath = `./${countResult}-${stock.desc}.txt`;
    fs.writeFileSync(filePath, boughtData.join("\n\n"));
    const file = new AttachmentBuilder(filePath);

    const embedSend = new EmbedBuilder()
      .setTitle("Successful Purchase")
      .setDescription(
        `You have purchased **${countResult} ${stock.desc}** for ${totalPrice.toLocaleString()} ${buyTypeInput === "tunai" ? process.env.WALLET_EMOJI : process.env.WL}
    ${discountDescription ? `\n${discountDescription}` : ''}
    ${discount ? `\nOriginal price: ${(originalPrice * (buyTypeInput === "tunai" ? rateData.WL : 1) * countResult).toLocaleString()} ${buyTypeInput === "tunai" ? process.env.WALLET_EMOJI : process.env.WL}` : ''}
    \nDon't forget to give reps, Thanks.`
      )
      .setColor("#7289DA")
      .setImage(process.env.STORE_BANNER);

    await interaction.editReply({
      content: "Product has been sent to your DM.",
      ephemeral: true,
    });
    await interaction.user.send({ embeds: [embedSend], files: [file] });
    fs.unlinkSync(filePath);

    const member = interaction.guild.members.cache.get(interaction.user.id)
    if(!member) return;
    if (member.roles.cache.has(stock.role) === false) {
      await member.roles.add(stock.role);
    }

    const IsCount = await History.findOne({ no: { $eq: 0 } });
    if (!IsCount) {
      await History.create({
        no: 0,
        discordid: 1,
        GrowID: "null",
        itemType: "null",
        itemName: "null",
        itemPrice: 1,
        totalLocks: 1,
      });
    }
    const countsz = await History.aggregate([
      { $group: { _id: "", last: { $max: "$no" } } },
    ]);

    const dogshit = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`**#Order Number** : ${countsz[0].last + 1}`)
      .setTimestamp()
      .setImage(process.env.STORE_BANNER)
      .setDescription(
        ` Buyer : **<@${interaction.user.id}>**
     Product : **${codeResult.toUpperCase()}**
     Product Name : **${stock.desc}**
     Amount : **${countResult}**
     Price : ${totalPrice.toLocaleString()} ${buyTypeInput === "tunai" ? process.env.WALLET_EMOJI : process.env.WL}
    ${discountDescription ? `\n${discountDescription}` : ''}`
      );

    await interaction.guild.channels.cache
      .get(process.env.HISTORY_CHANNEL)
      .send({ embeds: [dogshit] });

    const dataz = await user.findOne({
      discordID: { $eq: interaction.user.id },
    });

    await History.create({
      no: countsz[0].last + 1,
      discordid: interaction.user.id,
      GrowID: dataz.GrowID,
      itemType: codeResult.toUpperCase(),
      itemName: stock.desc,
      itemPrice: stock.harga,
      totalLocks: countResult,
    });

    const soldHistory = await SoldHistory.findOne({});
    if (soldHistory) {
      soldHistory.sold += countResult;
      soldHistory.save();
    } else {
      await SoldHistory.create({ sold: countResult });
    }
  }
}

module.exports = { buyModal, handleBuyModal };