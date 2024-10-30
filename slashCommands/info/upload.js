const { ApplicationCommandType } = require("discord.js");
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
  name: "upload",
  description: "get link",
  usage: "",
  category: "",
	userPerms: [""],
	botPerms: [""],
	cooldown: 0,
  guildOnly: false,
  ownerOnly: true,
  toggleOff: false,
  nsfwOnly: false,
  maintenance: false,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "file",
      description: "Upload a file",
      type: 11, // Attachment type
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const file = interaction.options.getAttachment("file");

    if (file) {
      const fileUrl = file.url; // Get the URL of the uploaded file

      // Log the URL to the console
      console.log("Uploaded file URL:", fileUrl);

      await interaction.reply({
        content: `File URL: ${fileUrl}`,
      });
    } else {
      await interaction.reply({
        content: "No file was uploaded.",
        ephemeral: true,
      });
    }
  },
};