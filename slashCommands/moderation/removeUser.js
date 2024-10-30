const schema = require("../../schemas/users");
const { EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    name: 'removeuser',
    description: "Remove a user from the database.",
    cooldown: 2,
    ownerOnly: true,
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: 'ManageGuild',
    options: [
        {
            name: 'user',
            description: 'The user you want to remove from the database.',
            type: 6,
            required: true
        }
    ],
    run: async (client, interaction) => {
        let user = interaction.options.getUser("user");

        const userData = await schema.findOne({
            discordID: user.id
        });

        if (!userData) {
            const notFoundEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("User Not Found")
                .setDescription(`User ${user.username} is not registered in the database.`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({
                embeds: [notFoundEmbed],
                ephemeral: true,
            });
            return;
        }

        try {
            await schema.findOneAndDelete({ discordID: user.id });

            const removeUserEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("User Removed")
                .setDescription(`Successfully removed **${user.username}** from the database.`)
                .addFields(
                    { name: "User ID", value: user.id, inline: true },
                    { name: "Player Name", value: userData.GrowID, inline: true },
                    { name: "Total Deposits", value: `${userData.totalDeposit} ${process.env.WL}`, inline: true },
                    { name: "Balance", value: `${userData.totalLocks} ${process.env.WL}`, inline: true },
                    { name: "Registered On", value: userData.createdAt.toDateString(), inline: true },
                    { name: "Last Updated", value: userData.updatedAt.toDateString(), inline: true }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Removed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({
                embeds: [removeUserEmbed],
                ephemeral: true
            });
        } catch (error) {
            console.error('Error removing user:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor("DarkRed")
                .setTitle("Error")
                .setDescription("An error occurred while trying to remove the user.")
                .addFields(
                    { name: "Error Details", value: error.message || "Unknown error" }
                )
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });
        }
    },
};