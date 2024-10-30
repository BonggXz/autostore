const client = require("..");
const { Collection } = require("discord.js");
const { updateBalance } = require("../functions/updateBalance");
// ================================================================================
client.on("messageCreate", async (message) => {
  try {
    if (message.webhookId) {
      await updateBalance(message, client);
    }
  } catch (error) {
    client.msg_err(client, message, error);
  }
});
