const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createReward } = require('../database/database-handler')

const data = new SlashCommandBuilder()
    .setName('setup-new-reward')
    .setDescription('Sets up a new reward with the specified parameters')
    .addRoleOption(option => option
        .setName('reward-role')
        .setDescription('The role given as reward for number of sent messages')
        .setRequired(true)
    )
    .addIntegerOption(option => option
        .setName('number-of-required-messages')
        .setDescription('The number of messages that should be sent to get the reward')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

async function execute(interaction) {
    const rewardRole = interaction.options.getRole('reward-role')
    const numberOfRequiredMessages = interaction.options.getInteger('number-of-required-messages')

    try {
        createReward(rewardRole.id, numberOfRequiredMessages)
    }
    catch (err) {
        return await interaction.reply('❌ An error has occured')
    }

    return await interaction.reply('✅ New reward was successfully created')
}

module.exports = {
    data,
    execute
}