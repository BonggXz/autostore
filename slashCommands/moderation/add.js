const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const DiscountSchema = require("../../schemas/discount");
const ProductSchema = require("../../schemas/stock");
const { addStock } = require("../../handlers/handlerStock");

module.exports = {
  name: "add",
  description: "Add various types of data to the database.",
  cooldown: 2,
  ownerOnly: true,
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: "Administrator",
  options: [
    {
      name: "product",
      description: "Add a product to the database.",
      type: 1,
      options: [
        {
          name: "code",
          description: "Product code",
          type: 3,
          required: true,
        },
        {
          name: "name",
          description: "Product name",
          type: 3,
          required: true,
        },
        {
          name: "price",
          description: "Product price",
          type: 10,
          required: true,
        },
        {
          name: "role",
          description: "Role associated with the product",
          type: 8,
          required: true,
        },
      ],
    },
    {
      name: "stock",
      description: "Restock a product.",
      type: 1,
      options: [
        {
          name: "code",
          description: "Product code",
          type: 3,
          required: true,
        },
        {
          name: "data",
          description: "License data to restock (input directly)",
          type: 3,
          required: false,
        },
        {
          name: "count",
          description: "Number of times to repeat the data (only for 'data' option)",
          type: 4,
          required: false,
        },
        {
          name: "file",
          description: "File containing licenses to restock (uses ':' to separate entries)",
          type: 11,
          required: false,
        },
      ],
    },
    {
      name: "discount",
      description: "Add a discount to a product",
      type: 1,
      options: [
        {
          name: "product_code",
          description: "Product code to apply the discount",
          type: 3,
          required: true,
        },
        {
          name: "type",
          description: "Type of discount",
          type: 3,
          required: true,
          choices: [
            { name: "Percentage", value: "percentage" },
            { name: "Buy X Get Y", value: "buyxgety" },
          ],
        },
        {
          name: "value",
          description: "Discount value (percentage or 'X,Y' for Buy X Get Y)",
          type: 3,
          required: true,
        },
        {
          name: "expiration",
          description: "Expiration date (YYYY-MM-DD)",
          type: 3,
          required: true,
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();

    const handlers = {
      product: handleProduct,
      stock: handleStock,
      discount: handleDiscount,
    };

    try {
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
      console.error(`Error in add command (${subCommand}):`, error);
      await interaction.reply({
        content: "An error occurred. Please try again.",
        ephemeral: true,
      });
    }
  },
};

async function handleProduct(interaction) {
  const code = interaction.options.getString("code").toLowerCase();
  const name = interaction.options.getString("name").toUpperCase();
  const price = interaction.options.getNumber("price");
  const role = interaction.options.getRole("role");

  const existingProduct = await ProductSchema.findOne({ code });
  if (existingProduct) {
    return interaction.reply({
      content: `Product with code ${code} already exists.`,
      ephemeral: true,
    });
  }

  await ProductSchema.create({
    code, desc: name, harga: price, data: [], role: role.id,
  });

  const productEmbed = new EmbedBuilder()
    .setColor("#313135")
    .setDescription(`Successfully added product **${name}** with code **${code}**.`);

  await interaction.reply({
    embeds: [productEmbed],
    ephemeral: true,
  });
}

async function handleStock(interaction) {
  const code = interaction.options.getString("code").toLowerCase();
  const data = interaction.options.getString("data");
  const count = interaction.options.getInteger("count") || 1;
  const file = interaction.options.getAttachment("file");

  if (file && data) {
    return await interaction.reply({ 
      content: "Please provide either 'data' or 'file', not both.", 
      ephemeral: true 
    });
  }

  if (!file && !data) {
    return await interaction.reply({ 
      content: "Please provide either 'data' or 'file'.", 
      ephemeral: true 
    });
  }

  let stockData = '';

  if (file) {
    if (count > 1) {
      return await interaction.reply({ 
        content: "The 'count' option cannot be used with file input.", 
        ephemeral: true 
      });
    }

    try {
      const response = await fetch(file.url);
      stockData = await response.text();
      stockData = stockData.split(':').join('\n');
    } catch (error) {
      console.error("Error reading file:", error);
      return await interaction.reply({ 
        content: "Error reading the uploaded file.", 
        ephemeral: true 
      });
    }
  } else {
    stockData = Array(count).fill(data).join('\n');
  }

  const result = await addStock(code, stockData);

  await interaction.reply({
    content: result.success 
      ? `Added stock for ${code}. Total items: ${result.newCount}.`
      : result.message,
    ephemeral: true
  });
}

async function handleDiscount(interaction) {
  const productCode = interaction.options.getString("product_code").toLowerCase();
  const discountType = interaction.options.getString("type");
  const discountValue = interaction.options.getString("value");
  const expiration = interaction.options.getString("expiration");

  const product = await ProductSchema.findOne({ code: productCode });
  if (!product) {
    return interaction.reply({
      content: `Product with code ${productCode} does not exist.`,
      ephemeral: true,
    });
  }

  const expirationDate = new Date(expiration);
  if (isNaN(expirationDate.getTime())) {
    return interaction.reply({
      content: "Invalid expiration date. Please use YYYY-MM-DD format.",
      ephemeral: true,
    });
  }

  let parsedValue;
  if (discountType === "percentage") {
    parsedValue = parseInt(discountValue);
    if (isNaN(parsedValue) || parsedValue <= 0 || parsedValue > 100) {
      return interaction.reply({
        content: "Percentage discount must be a number between 1 and 100.",
        ephemeral: true,
      });
    }
  } else if (discountType === "buyxgety") {
    const [x, y] = discountValue.split(',').map(Number);
    if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) {
      return interaction.reply({
        content: "Buy X Get Y discount must be in the format 'X,Y' where X and Y are positive numbers.",
        ephemeral: true,
      });
    }
    parsedValue = { x, y };
  }

  try {
    const existingDiscount = await DiscountSchema.findOne({ productCode });
    if (existingDiscount) {
      existingDiscount.type = discountType;
      existingDiscount.value = parsedValue;
      existingDiscount.expiration = expirationDate;
      await existingDiscount.save();
    } else {
      await DiscountSchema.create({
        productCode,
        type: discountType,
        value: parsedValue,
        expiration: expirationDate,
      });
    }

    const discountEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Discount Added/Updated")
      .setDescription(`A discount has been added/updated for product ${productCode}:`)
      .addFields(
        { name: "Type", value: discountType, inline: true },
        { name: "Value", value: discountValue, inline: true },
        { name: "Expiration", value: expiration, inline: true }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [discountEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error creating/updating discount:", error);
    await interaction.reply({
      content: "An error occurred while creating/updating the discount. Please try again.",
      ephemeral: true,
    });
  }
}