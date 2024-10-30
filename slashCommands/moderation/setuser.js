const Users = require("../../schemas/users");
const { ApplicationCommandType } = require("discord.js");
module.exports = {
  name: "set",
  description: "set user.",
  cooldown: 2,
  ownerOnly: true,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: "ManageGuild", // permission required
  options: [
    {
      name: "user",
      description: "set user.",
      type: 1,
      options: [
        {
          name: "user",
          description: "The user you want to setuser.",
          type: 6,
          required: true,
        },
        {
          name: "growid",
          description: "The growid you want to add.",
          type: 3,
          required: true,
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    let player = interaction.options.getUser("user");
    let growIdResult = interaction.options.getString("growid");

    const datas = await Users.findOne({
      discordID: { $eq: player.id },
    });

    const usernames = await Users.findOne({
      GrowID: { $eq: growIdResult.toUpperCase() },
    });

    if (usernames) {
      interaction.reply({
        content: `[ERROR] \`${growIdResult}\`**, Alredy To Set**`,
        ephemeral: true,
      });
      return;
    }

    if (!datas) {
      await Users.create({
        discordID: player.id,
        GrowID: growIdResult.toUpperCase(),
        totalDeposit: 0,
        totalLocks: 0,
        walletBalance: 0,
      });
      interaction.reply({
        content: `[SUCCES] \`${growIdResult}\`**, GrowId Has Ben Set!!**`,
        ephemeral: true,
      });
      return;
    }

    datas.GrowID = growIdResult.toUpperCase();
    datas.save();

    await interaction.reply({
      content: `[SUCCES] Replace Growid To: \`${growIdResult}\``,
      ephemeral: true,
    });
  },
};
