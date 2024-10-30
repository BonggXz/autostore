const fs = require('fs');
const path = require('path');
const { PermissionsBitField } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

module.exports = async (client) => {
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = client.config.SERVER.OFFICIAL.Guild_ID_1 || process.env.GUILD_ID;
  const rest = new REST({ version: '9' }).setToken(TOKEN);
  const slashCommands = [];
  let loadedCommands = 0;
  let errorCommands = 0;

  const directories = fs.readdirSync('./slashCommands/');

  for (const dir of directories) {
    const files = fs.readdirSync(path.join('./slashCommands', dir)).filter(file => file.endsWith('.js'));

    for (const file of files) {
      try {
        const slashCommand = require(`../slashCommands/${dir}/${file}`);
        slashCommands.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options || null,
          default_permission: slashCommand.default_permission || null,
          default_member_permissions: slashCommand.default_member_permissions
            ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString()
            : null
        });

        if (slashCommand.name) {
          client.slashCommands.set(slashCommand.name, slashCommand);
          loadedCommands++;
        } else {
          errorCommands++;
          client.logger(`Command Error: ${slashCommand.name || file.split('.js')[0] || "Missing Name"}`.brightRed);
        }
      } catch (error) {
        errorCommands++;
        client.logger(`Error loading command ${file}: ${error.message}`.brightRed);
      }
    }
  }

  try {
    // Register commands and get response
    const data = await rest.put(
      GUILD_ID
        ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
        : Routes.applicationCommands(CLIENT_ID),
      { body: slashCommands }
    );
    
    // Log each command's ID and name from the response
    console.log(`Successfully registered ${data.length} commands with ${errorCommands} errors.`);
    data.forEach(command => {
      //console.log(`Command registered: Name = ${command.name}, ID = ${command.id}`);
    });

  } catch (error) {
    console.error('Error registering commands:', error);
  }

  return { loadedCommands, errorCommands };
};