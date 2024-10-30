const { deleteStock } = require("../../handlers/handlerStock");
const { EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
	name: 'delete',
	description: "delete product from database.",
	cooldown: 2,
    ownerOnly: true,
	type: ApplicationCommandType.ChatInput,
	default_member_permissions: 'Administrator',
	options: [
        {
            name: 'product',
            description: 'delete product from database.',
            type: 1,
            options: [
                {
                    name: 'code',
                    description: 'code your product',
                    type: 3,
                    required: true,
                }
            ]
        }
    ],
	run: async (client, interaction) => {
        const code = interaction.options.getString("code");

        const embed = new EmbedBuilder()
        .setColor("LuminousVividPink")
        .setDescription(`Stock for ${code} deleted.`)
        .setFooter({
            text: `Interaction By ${interaction.user.username}`
        })
        .setTimestamp()

        const success = await deleteStock(code);
        if (success) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        } else {
            await interaction.reply({ content: `No stock found for ${code}.`, ephemeral: true });
            return;
        }

  },
};