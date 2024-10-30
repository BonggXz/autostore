const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } = require('discord.js');
const Users = require('../schemas/users');

function setUserModal() {
    const modal = new ModalBuilder()
        .setCustomId('set_user_modal')
        .setTitle('Set Name');

    const growIdInput = new TextInputBuilder()
        .setCustomId('growid_input')
        .setLabel('Name:')
        .setPlaceholder('Input Your Name Here And Make Sure It\'s Correct!')
        .setStyle(TextInputStyle.Short)

        .setMinLength(1)
        .setMaxLength(50)
        .setRequired(true);

    const confirmGrowIdInput = new TextInputBuilder()
        .setCustomId('re_input_gid')
        .setLabel('Confirm Your Name:')
        .setPlaceholder('Input Same Like Above!')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(50)
        .setRequired(true);

    const growIdRow = new ActionRowBuilder().addComponents(growIdInput);
    const confirmGrowIdRow = new ActionRowBuilder().addComponents(confirmGrowIdInput);
    modal.addComponents(growIdRow, confirmGrowIdRow);

    return modal;
}

async function handleSetUserModal(interaction) {
    if (interaction.customId === 'set_user_modal') {
        if (interaction.replied || interaction.deferred) return;
        await interaction.deferReply({ ephemeral: true });

        const growIdResult = interaction.fields.getTextInputValue('growid_input').trim();
        const confirmGrowIdResult = interaction.fields.getTextInputValue('re_input_gid').trim();

        const alpha = /^[a-zA-Z0-9]+$/;
        if (!alpha.test(growIdResult)) {
            await interaction.editReply({
                content: `Please only input Alphabet char.`,
                ephemeral: true
            });
            return;
        }

        if (growIdResult.toUpperCase() !== confirmGrowIdResult.toUpperCase()) {
            await interaction.editReply({
                content: `Please input the same Name in both fields.`,
                ephemeral: true
            });
            return;
        }

        const datas = await Users.findOne({
            discordID: { $eq: interaction.user.id },
        });

        const usernames = await Users.findOne({
            GrowID: { $eq: growIdResult.toUpperCase() },
        });

        if (usernames) {
            await interaction.editReply({
                content: `The Name is already in use.`,
                ephemeral: true
            });
            return;
        }

        if (!datas) {
            await Users.create({
                discordID: interaction.user.id,
                GrowID: growIdResult.toUpperCase(),
                totalDeposit: 0,
                totalLocks: 0,
                walletBalance: 0,
                totalWallet: 0
            });
            await interaction.editReply({
                content: `Successfully set your Name to **${growIdResult}**.`,
                ephemeral: true
            });
            return;
        }

        const previousGrowID = datas.GrowID;
        datas.GrowID = growIdResult.toUpperCase();
        await datas.save();

        await interaction.editReply({
            content: `Successfully updated your Name from **${previousGrowID}** to **${growIdResult}**.`,
            ephemeral: true
        });
    }
}

module.exports = { setUserModal, handleSetUserModal };