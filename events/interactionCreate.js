const client = require('..');
const {
  EmbedBuilder,
  Collection,
  PermissionsBitField,
  InteractionType,
  ButtonBuilder,

  ButtonStyle,
  ActionRowBuilder,

} = require('discord.js');
const { slash } = require(process.cwd() + "/functions/onCoolDown.js");
const emojis = require(process.cwd() + "/json/emojis.json");
const { getButtonStatus } = require("../functions/buttonStatus");
const { DepositInfo } = require('../handlers/selectHandler/depo');
const { BalanceCheck } = require("../handlers/selectHandler/balance");
const { buyModal, handleBuyModal } = require("../modal/buy");
const { setUserModal, handleSetUserModal } = require("../modal/setuser");
const user = require("../schemas/users");
const Rate = require('../schemas/rate');

client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    const action = interaction.customId;
    switch (action) {
      case "how_to_buy":
        await howToBuyInfo(interaction);
        break;
      case "deposit":
      let rate = await Rate.findOne({});

        if (!rate) {
          const isOwner = client.config.DEV.OWNER.includes(interaction.user.id);

          return interaction.reply({
            content: isOwner ? "You're Owner, but you didn't set rate. Please set it first by executing /change rate" : "Owner not yet set rate. Please tell owner to set it first",
            ephemeral: true,
          });
        }

        await DepositInfo(interaction);
        break;
      case "check_balance":
        await BalanceCheck(interaction);
        break;
      case "set_growid":
        const setUserModalInstance = setUserModal();
        await interaction.showModal(setUserModalInstance);
        break;
      case "buy":
        let rates = await Rate.findOne({});
        if (!rates) {
          const isOwner = client.config.DEV.OWNER.includes(interaction.user.id);

          return interaction.reply({
            content: isOwner ? "You're Owner, but you didn't set rate. Please set it first by executing /change rate" : "Owner not yet set rate. Please tell owner to set it first",
            ephemeral: true,
          });
        }
        
        const users = await user.findOne({ discordID: interaction.user.id });
        
        if (!users) {
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
        
        const buyModalInstance = buyModal();
        await interaction.showModal(buyModalInstance);
        break;
    }
  } else if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === "set_user_modal") {
      await handleSetUserModal(interaction);
    } else if (interaction.customId === "buy_modal") {
      await handleBuyModal(interaction);
    }
  }

  if (interaction.isButton() && interaction.customId === "setGrowID") {
    const modal = setUserModal();
    await interaction.showModal(modal);
  }

  const command = client.slashCommands.get(interaction.commandName);
  if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
    if (command.autocomplete) {
      const choices = [];
      await command.autocomplete(interaction, choices);
    }
  }
  
  if (!interaction.type == InteractionType.ApplicationCommand) return;
  if (!command) return client.slashCommands.delete(interaction.commandName);
  
  try {
    if (command.toggleOff) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setTitle(emojis.MESSAGE.x + " **That Command Has Been Disabled By The Developers! Please Try Later.**").setColor(client.embed.wrongcolor)]
      });
    }
    
    if (command.maintenance) {
      return await interaction.reply({
        ephemeral: true,
        content: emojis.MESSAGE.x + " **" + command.name + " command is on __Maintenance Mode__** try again later!"
      });
    }
    
    if (command.ownerOnly) {
      if (!client.config.DEV.OWNER.concat(client.config.DEV.CO_OWNER).includes(interaction.user.id)) {
        return await interaction.reply({
          ephemeral: true,
          embeds: [new EmbedBuilder().setDescription(emojis.MESSAGE.x + " **You cannot use `" + command.name + "` command as this is a developer command.**").setColor(client.embed.wrongcolor)]
        });
      }
    }
    
    if (command.guildOnly) {
      if (!client.config.SERVER.OFFICIAL.Guild_ID_1.concat(client.config.SERVER.Guild_ID_2).includes(interaction.guild.id)) {
        return interaction.reply({
          ephemeral: true,
          embeds: [new EmbedBuilder().setTitle(emojis.MESSAGE.x + " " + interaction.user.username + " You have entered an invalid command!").setDescription("The command `" + command.name + "` can only be used in the official server.").setColor(client.embed.wrongcolor)]
        });
      }
    }
    
    if (command.nsfwOnly && !interaction.channel.nsfw) {
      return interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setDescription(emojis.MESSAGE.x + " This command can only be used in NSFW channels!").setColor(client.embed.wrongcolor)]
      });
    }
    
    if (command.userPerms || command.botPerms) {
      if (!interaction.memberPermissions.has(PermissionsBitField.resolve(command.userPerms || []))) {
        const userPerms = new EmbedBuilder().setDescription(emojis.MESSAGE.x + " " + interaction.user + ", You don't have `" + command.userPerms + "` permissions to use this command!").setColor(client.embed.wrongcolor);
        return interaction.reply({ ephemeral: true, embeds: [userPerms] });
      }
      
      if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPerms || []))) {
        const botPerms = new EmbedBuilder().setDescription(emojis.MESSAGE.x + " " + interaction.user + ", I don't have `" + command.botPerms + "` permissions to use this command!").setColor(client.embed.wrongcolor);
        return interaction.reply({ ephemeral: true, embeds: [botPerms] });
      }
    }
    
    const nowDate = Date.now();
    const cooldownKey = `${interaction.user.id}_${command.name}`;
    
    if (!client.cooldowns) {
      client.cooldowns = new Collection();
    }
    
    if (client.cooldowns.has(cooldownKey)) {
      const waitedDate = client.cooldowns.get(cooldownKey) - nowDate;
      return interaction.reply({
        content: `Cooldown is active now, please <t:${Math.floor(new Date(nowDate + waitedDate).getTime() / 1000)}:R> try again later.`,
        ephemeral: true,
      }).then(msg => setTimeout(() => msg.delete(), waitedDate + 1000));
    } else {
      const cooldownAmount = (command.cooldown || 1) * 1000;
      client.cooldowns.set(cooldownKey, nowDate + cooldownAmount);
      setTimeout(() => client.cooldowns.delete(cooldownKey), cooldownAmount);
    }
    
    await command.run(client, interaction);
  } catch (error) {
    client.slash_err(client, interaction, error);
  }
});
