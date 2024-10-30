const { AttachmentBuilder, EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { buyStock } = require("../../handlers/handlerStock");
const user = require("../../schemas/users");
const Stocks = require("../../schemas/stock");
const SoldHistory = require('../../schemas/sold');
const History = require("../../schemas/testimoni");
const Rate = require("../../schemas/rate");
const fs = require("fs");

module.exports = {
  name: "send",
  description: "Send product to a member.",
  cooldown: 2,
  ownerOnly: true,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: 'Administrator',
  options: [
    {
      name: "product",
      description: "Send product to a member.",
      type: 1,
      options: [
        {
          name: "user",
          description: "The user to send the product to.",
          type: 6,
          required: true,
        },
        {
          name: "code",
          description: "Product code.",
          type: 3,
          required: true,
        },
        {
          name: "amount",
          description: "Amount of product to send.",
          type: 4,
          required: true,
        },
        {
          name: 'type',
          description: 'Choose whether to use Wallet or Locks.',
          type: 3,
          required: true,
          choices: [
            { name: 'Wallet', value: 'wallet' },
            { name: 'Locks', value: 'locks' },
          ],
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const player = interaction.options.getUser("user");
    const codeResult = interaction.options.getString("code").toLowerCase();
    const countResult = interaction.options.getInteger("amount");
    const type = interaction.options.getString("type");

    if (countResult < 0) {
      return await interaction.reply({ content: "Please enter a valid amount.", ephemeral: true });
    }

    const users = await user.findOne({ discordID: player.id });
    if (!users) {
      return await interaction.reply({
        content: `That user hasn't registered yet. Please register first.`,
        ephemeral: true,
      });
    }

    const stock = await Stocks.findOne({ code: codeResult });
    if (!stock) {
      return await interaction.reply({ content: `Invalid product code.`, ephemeral: true });
    }

    const rateData = await Rate.findOne({});
    const totalPrice = stock.harga * (type === 'wallet' ? rateData.WL : 1) * countResult;

    if ((type === 'wallet' ? users.walletBalance : users.totalLocks) < totalPrice) {
      return await interaction.reply({
        content: `Insufficient ${type === 'wallet' ? 'Wallet' : process.env.WL}. Needed: ${totalPrice}`,
        ephemeral: true,
      });
    }

    if (stock.data.length < countResult) {
      return await interaction.reply({
        content: `Insufficient stock for ${codeResult}.`,
        ephemeral: true,
      });
    }

    if (type === 'wallet') {
      users.walletBalance -= totalPrice;
    } else {
      users.totalLocks -= totalPrice;
    }
    await users.save();

    const boughtData = await buyStock(codeResult, countResult);
    const stockData = `Your Product Here ${player.username}:\n\n${boughtData.join("\n\n")}`;

    const filePath = `./${countResult}-${stock.desc}.txt`;
    fs.writeFileSync(filePath, stockData);

    const embedSend = new EmbedBuilder()
      .setTitle("Successful Purchase")
      .setDescription(
        `You have purchased **${countResult} ${stock.desc}** for ${totalPrice} ${type === 'wallet' ? 'from your Wallet' : process.env.WL}\nDon't forget to give reps, Thanks.`
      )
      .setColor("#7289DA")
      .setImage(process.env.STORE_BANNER);

    const file = new AttachmentBuilder(filePath);
    await interaction.reply({ content: "Product data has been sent.", ephemeral: true });
    await player.send({ embeds: [embedSend], files: [file] });
    fs.unlinkSync(filePath);

    const member = interaction.guild.members.cache.get(player.id);
    if (member && !member.roles.cache.has(stock.role)) {
      await member.roles.add(stock.role);
    }

    let historyCount = await History.findOne({ no: 0 });
    if (!historyCount) {
      historyCount = await History.create({
        no: 0,
        discordid: 1,
        GrowID: "null",
        itemType: "null",
        itemName: "null",
        itemPrice: 1,
        totalLocks: 1,
      });
    }

    const lastNo = await History.findOne({}, {}, { sort: { 'no': -1 } });
    const newNo = (lastNo?.no ?? 0) + 1;

    const orderEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`**#Order Number** : ${newNo}`)
      .setTimestamp()
      .setImage(process.env.STORE_BANNER)
      .setDescription(
        `${process.env.TITIK} Buyer : **<@${player.id}>**
        ${process.env.TITIK} Product : **${codeResult.toUpperCase()}**
        ${process.env.TITIK} Product Name : **${stock.desc}**
        ${process.env.TITIK} Amount : **${countResult}**
        ${process.env.TITIK} Price : **${totalPrice.toLocaleString()} ${type === 'wallet' ? process.env.WALLET_EMOJI : process.env.WL}**`
      );

    const historyChannel = interaction.guild.channels.cache.get(process.env.HISTORY_CHANNEL);
    console.log(historyChannel, typeof historyChannel)
    if (historyChannel) {
      await historyChannel.send({ embeds: [orderEmbed] });
    }

    await History.create({
      no: newNo,
      discordid: player.id,
      GrowID: users.GrowID,
      itemType: codeResult.toUpperCase(),
      itemName: stock.desc,
      itemPrice: stock.harga,
      totalLocks: countResult,
    });

    await SoldHistory.findOneAndUpdate({}, { $inc: { sold: countResult } }, { upsert: true });
  },
};