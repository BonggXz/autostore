const User = require("../schemas/users");
const Rate = require("../schemas/rate");
const { EmbedBuilder } = require("discord.js");

function calculate(inputan, RATE_WL, RATE_DL) {
  if (inputan < RATE_DL) {
    const quotient = inputan / RATE_WL;
    const integer = Math.floor(quotient);
    return integer;
  } else {
    const RATE_PECAHAN = RATE_DL / 100;
    const quotient = inputan / RATE_PECAHAN;
    const integer = Math.floor(quotient);
    return integer;
  }
}

const updateBalance = async (webhookMessage, client) => {
  if (webhookMessage.embeds.length > 0) {
    const embed = webhookMessage.embeds[0];
    const description = embed.description;

    // Handle deposits with World Lock, Diamond Lock, or Blue Gem Lock
    if (description && description.includes("GrowID:") && description.includes("Deposit:")) {
      const growIdMatch = description.match(/GrowID: (\S+)\nDeposit: (\d+) (World Lock|Diamond Lock|Blue Gem Lock)/);

      if (growIdMatch) {
        const growId = growIdMatch[1].toLowerCase();
        let total = parseInt(growIdMatch[2]);
        const item = growIdMatch[3];
        let newBalance;

        // Calculate new balance based on item type
        if (item === "World Lock") {
          newBalance = total;
        } else if (item === "Diamond Lock") {
          newBalance = total * 100;
        } else if (item === "Blue Gem Lock") {
          newBalance = total * 100 * 100;
        } else {
          const invalidEmbed = new EmbedBuilder()
            .setTitle("Invalid Item Type")
            .setColor("#7289DA")
            .setDescription("Invalid item type detected.");
          await webhookMessage.channel.send({ embeds: [invalidEmbed] });
          return;
        }

        const user = await User.findOne({
          GrowID: { $regex: `^${growId}$`, $options: "i" },
        });

        if (user) {
          const userId = user.discordID;
          newBalance += user.totalLocks; // Adding new deposit to current balance

          await User.updateOne(
            { GrowID: { $regex: `^${growId}$`, $options: "i" } },
            { $set: { totalLocks: newBalance, totalDeposit: newBalance } }
          );

          const formattedNewBalance = newBalance.toLocaleString().replace(/,/g, ".");

          let itemIcon;
          if (item === "World Lock") {
            itemIcon = process.env.WL;
          } else if (item === "Diamond Lock") {
            itemIcon = process.env.DL;
          } else if (item === "Blue Gem Lock") {
            itemIcon = process.env.BGL;
          }

          const balanceEmbed = new EmbedBuilder()
            .setTitle("Balance Updated")
            .setColor("#7289DA")
            .setDescription(
              `Success Adding **${total} ${itemIcon}** to **${growId}**\nNow Your Balance is **${formattedNewBalance}** ${process.env.WL}`
            );

          const userObj = await client.users.fetch(userId);
          await userObj.send({ embeds: [balanceEmbed] });
          await webhookMessage.channel.send({ embeds: [balanceEmbed] });
        } else {
          const userNotFoundEmbed = new EmbedBuilder()
            .setTitle("User Not Found")
            .setColor("#7289DA")
            .setDescription("User not found in the database.");
          await webhookMessage.channel.send({ embeds: [userNotFoundEmbed] });
        }
      }
    }

    // Handle payments in Rupiah
    if (embed.title) {
      const match = embed.title.match(/(\w+) melakukan pembayaran dengan nominal Rp\.? ?([\d.]+)/i);
      console.log(embed.title);
      console.log(embed.description);

      if (match) {
        const growId = match[1].toLowerCase();
        const total = parseInt(match[2].replace(/\./g, "")); // Remove dots and convert to integer

        const user = await User.findOne({
          GrowID: { $regex: `^${growId}$`, $options: "i" },
        });

        if (user) {
          const userId = user.discordID;
          user.walletBalance += total; // Safely increment balance
          user.totalWallet = user.walletBalance;
          await user.save();

          const sawerEmbed = new EmbedBuilder()
            .setTitle("Balance Updated")
            .setColor("#7289DA")
            .setDescription(
              `Berhasil TopUp Sebesar **Rp ${total.toLocaleString().replace(/,/g, ".")}** ke ${growId}\nSaldo Rupiah terbaru: Rp. ${user.walletBalance
                .toLocaleString()
                .replace(/,/g, ".")}`
            );

          const userObj = await client.users.fetch(userId);
          await userObj.send({ embeds: [sawerEmbed] });
          await webhookMessage.channel.send({ embeds: [sawerEmbed] });
        } else {
          const userNotFoundEmbed = new EmbedBuilder()
            .setTitle("User Not Found")
            .setColor("#7289DA")
            .setDescription("User not found in the database.");
          await webhookMessage.channel.send({ embeds: [userNotFoundEmbed] });
        }
      }
    }

    // Handle rate check and update
    if (embed.description) {
    const matcht = embed.description.match(/(\w+) melakukan pembayaran trakteer dengan nominal Rp\.? ?([\d.]+)/i);
    console.log(embed.title)
    console.log(embed.description)

      let rate = await Rate.findOne();

      if (!rate) {
        const newRate = new Rate();
        await newRate.save();
        return webhookMessage.channel.send({
          content: "Rate not found, default rates applied.",
          ephemeral: true,
        });
      }

      if (matcht) {
        const growId = matcht[1].toLowerCase(); // Username
        const totalStr = matcht[2].replace(/\./g, ""); // Remove dots
        const total = parseInt(totalStr); // Convert to integer

        const user = await User.findOne({
          GrowID: { $regex: `^${growId}$`, $options: "i" },
        });

        if (user) {
          const userId = user.discordID;

          user.walletBalance += total;
          await user.save();

          const sawerEmbed = new EmbedBuilder()
            .setTitle("Balance Updated")
            .setColor("#7289DA")
            .setDescription(
              `Berhasil TopUp Sebesar **Rp ${total.toLocaleString().replace(/,/g, ".")}** ke ${growId}\nSaldo Rupiah terbaru: Rp. ${user.walletBalance
                .toLocaleString()
                .replace(/,/g, ".")}`
            );

          const userObj = await client.users.fetch(userId);
          await userObj.send({ embeds: [sawerEmbed] });
          await webhookMessage.channel.send({ embeds: [sawerEmbed] });
        } else {
          const userNotFoundEmbed = new EmbedBuilder()
            .setTitle("User Not Found")
            .setColor("#7289DA")
            .setDescription("User not found in the database.");
          await webhookMessage.channel.send({ embeds: [userNotFoundEmbed] });
        }
      }
    }
  }
};

module.exports = { updateBalance };
