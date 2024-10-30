const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const Stock = require("../../schemas/stock");
const Rate = require("../../schemas/rate");
const Depo = require("../../schemas/depo");
const Discount = require("../../schemas/discount");

module.exports = {
  name: "change",
  description: "Change various settings including product details and world information.",
  cooldown: 2,
  ownerOnly: true,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: "Administrator",
  options: [
    {
      name: "rate",
      description: "Update the DL and WL rates.",
      type: 1,
      options: [
        {
          name: "rate_dl",
          description: "Input the new DL rate.",
          type: 10,
          required: true,
        },
        {
          name: "rate_wl",
          description: "Input the new WL rate.",
          type: 10,
          required: true,
        },
      ],
    },
    {
      name: "world",
      description: "Change the world settings.",
      type: 1,
      options: [
        {
          name: "world",
          description: "Input World Depo.",
          type: 3,
          required: true,
        },
        {
          name: "owner",
          description: "Input Owner Depo.",
          type: 3,
          required: true,
        },
        {
          name: "bot",
          description: "Input Bot Depo.",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "product_data",
      description: "Change product data.",
      type: 1,
      options: [
        {
          name: "code",
          description: "Input the product code.",
          type: 3,
          required: true,
        },
        {
          name: "new_code",
          description: "Input the new product code.",
          type: 3,
          required: false,
        },
        {
          name: "name",
          description: "Input the new product name.",
          type: 3,
          required: false,
        },
        {
          name: "role",
          description: "Input the new product role.",
          type: 3,
          required: false,
        },
        {
          name: "desc",
          description: "Input the new product description.",
          type: 3,
          required: false,
        },
        {
          name: "price",
          description: "Input the new product price.",
          type: 10,
          required: false,
        },
      ],
    },
    {
      name: "discount_data",
      description: "Change discount data.",
      type: 1,
      options: [
        {
          name: "code",
          description: "Input the product code.",
          type: 3,
          required: true,
        },
        {
          name: "type",
          description: "Input the discount type (percentage or buyxgety).",
          type: 3,
          required: false,
          choices: [
            { name: "Percentage", value: "percentage" },
            { name: "Buy X Get Y", value: "buyxgety" },
          ],
        },
        {
          name: "value",
          description: "Input the discount value.",
          type: 3,
          required: false,
        },
        {
          name: "expiration",
          description: "Input the expiration date (YYYY-MM-DD).",
          type: 3,
          required: false,
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();

    try {
      const handlers = {
        rate: handleRateChange,
        world: handleWorldChange,
        product_data: handleProduct,
        discount_data: handleDiscount,
      };

      const handler = handlers[subCommand];
      if (handler) {
        await handler(interaction);
      } else {
        await interaction.reply({
          content: `Invalid subcommand: ${subCommand}`,
          ephemeral: true
        });
      }
    } catch (error) {
      console.error(`Error in change command (${subCommand}):`, error);
      client.slash_err(client, interaction, error);
    }
  },
};

async function handleRateChange(interaction) {
  const newRateDL = interaction.options.getNumber("rate_dl");
  const newRateWL = interaction.options.getNumber("rate_wl");

  const rate = await Rate.findOneAndUpdate(
    {},
    { DL: newRateDL, WL: newRateWL },
    { upsert: true, new: true }
  );

  await interaction.reply({
    content: `Rates updated successfully!\nNew DL Rate: \`${rate.DL}\`\nNew WL Rate: \`${rate.WL}\``,
    ephemeral: true,
  });
}

async function handleWorldChange(interaction) {
  const world = interaction.options.getString("world").toUpperCase();
  const owner = interaction.options.getString("owner").toUpperCase();
  const bot = interaction.options.getString("bot");

  const deposit = await Depo.findOneAndUpdate(
    {},
    { world, owner, bot },
    { upsert: true, new: true }
  );

  await interaction.reply({
    content: `Success ${deposit.isNew ? 'Create' : 'Update'}\nWorld Depo: ${world}\nOwner Depo: ${owner}\nBot In World: ${bot}`,
    ephemeral: true,
  });
}

async function handleProduct(interaction) {
  const code = interaction.options.getString("code");
  const newCode = interaction.options.getString("new_code");
  const name = interaction.options.getString("name");
  const role = interaction.options.getString("role");
  const desc = interaction.options.getString("desc");
  const price = interaction.options.getNumber("price");

  const updateData = {};
  if (newCode) updateData.code = newCode;
  if (name) updateData.desc = name.toUpperCase();
  if (role) updateData.role = role;
  if (desc) updateData.desc = desc;
  if (price !== null && price !== undefined) updateData.harga = price;

  const stock = await Stock.findOneAndUpdate({ code }, updateData, { new: true });

  if (!stock) {
    return interaction.reply({
      content: `Product with code ${code} not found.`,
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: `Product data for code ${code} has been updated successfully.`,
    ephemeral: true,
  });
}

async function handleDiscount(interaction) {
  const code = interaction.options.getString("code");
  const type = interaction.options.getString("type");
  const value = interaction.options.getString("value");
  const expiration = interaction.options.getString("expiration");

  const updateData = {};
  if (type) updateData.type = type;
  if (value) updateData.value = type === "percentage" ? parseFloat(value) : value;
  if (expiration) updateData.expiration = new Date(expiration);

  const discount = await Discount.findOneAndUpdate(
    { productCode: code },
    updateData,
    { new: true, upsert: true }
  );

  await interaction.reply({
    content: `Discount data for product code ${code} has been ${discount.isNew ? 'created' : 'updated'} successfully.`,
    ephemeral: true,
  });
}