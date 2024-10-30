const schema = require("../../schemas/users");
const { EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
  name: 'balance',
  description: "Manage balance for users.",
  cooldown: 2,
  ownerOnly: true,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: 'ManageGuild',
  options: [
    {
      name: 'remove',
      description: 'Remove balance from a user.',
      type: 1,
      options: [
        {
          name: 'user',
          description: 'The user you want to remove balance from.',
          type: 6,
          required: true,
        },
        {
          name: 'amount',
          description: 'The amount you want to remove.',
          type: 4,
          required: true,
        },
        {
          name: 'type',
          description: 'Choose whether to remove from Wallet or Locks.',
          type: 3,
          required: true,
          choices: [
            {
              name: 'Wallet',
              value: 'wallet',
            },
            {
              name: 'Locks',
              value: 'locks',
            },
          ],
        },
      ],
    },
    {
      name: 'give',
      description: 'Give balance to a user.',
      type: 1,
      options: [
        {
          name: 'user',
          description: 'The user you want to add balance to.',
          type: 6,
          required: true,
        },
        {
          name: 'amount',
          description: 'The amount you want to add.',
          type: 4,
          required: true,
        },
        {
          name: 'type',
          description: 'Choose whether to add to Wallet or Locks.',
          type: 3,
          required: true,
          choices: [
            {
              name: 'Wallet',
              value: 'wallet',
            },
            {
              name: 'Locks',
              value: 'locks',
            },
          ],
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const type = interaction.options.getString('type');

    try {
      const userData = await schema.findOne({ discordID: user.id });

      if (!userData) {
        return interaction.reply({
          content: `User tersebut belum registrasi`,
          ephemeral: true,
        });
      }

      const handlers = {
        remove: handleRemove,
        give: handleGive
      };

      const handler = handlers[subCommand];
      if (handler) {
        await handler(interaction, userData, user, amount, type);
      } else {
        await interaction.reply({
          content: `Invalid subcommand: ${subCommand}`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error(`Error in balance command (${subCommand}):`, error);
      await interaction.reply({
        content: "An error occurred. Please try again.",
        ephemeral: true,
      });
    }
  },
};

async function handleRemove(interaction, userData, user, amount, type) {
  const balanceType = type === 'wallet' ? 'wallet' : 'totalLocks';

  if (userData[balanceType] <= 0) {
    return interaction.reply({
      content: `User tidak memiliki cukup saldo di ${balanceType === 'wallet' ? 'Wallet' : 'Locks'}.`,
      ephemeral: true,
    });
  }

  userData[balanceType] -= amount;
  await userData.save();

  const removeBalanceEmbed = new EmbedBuilder()
    .setColor("Red")
    .setDescription(
      `You removed **${amount.toLocaleString()} ${type === 'wallet' ? `${process.env.WALLET_EMOJI}` : `${process.env.WL}`}** from **${user.username}#${user.discriminator}'s ${type === 'wallet' ? 'Wallet' : 'Locks'}**.`
    );

  await interaction.reply({
    embeds: [removeBalanceEmbed],
    ephemeral: true,
  });
}

async function handleGive(interaction, userData, user, amount, type) {
  if (type === 'wallet') {
    userData.walletBalance += amount;
    userData.totalWallet += amount;
  } else {
    userData.totalLocks += amount;
    userData.totalDeposit += amount;
  }

  await userData.save();

  const addBalanceEmbed = new EmbedBuilder()
    .setColor("Green")
    .setDescription(
      `You added **${amount.toLocaleString()} ${type === 'wallet' ? `${process.env.WALLET_EMOJI}` : `${process.env.WL}`}** to **${user.username}#${user.discriminator}'s ${type === 'wallet' ? 'Wallet' : 'Locks'}**.`
    );

  await interaction.reply({
    embeds: [addBalanceEmbed],
    ephemeral: true,
  });
}