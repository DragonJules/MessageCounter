import { SlashCommandBuilder, PermissionFlagsBits, Interaction, CommandInteraction, ChatInputCommandInteraction, Snowflake, ChannelType } from 'discord.js'
import { getRequiredMessageCount, getAllRewards, deleteReward, createOrEditReward } from '../database-handler.js'
import { replyError } from '../util/reply-error.js'

export const data = new SlashCommandBuilder()
    .setName('rewards')
    .setDescription('Manage rewards or get information about them')
    .addSubcommandGroup(group => group
        .setName('manage')
        .setDescription('Manages the rewards')
        .addSubcommand(subcommand => subcommand
            .setName('create-or-edit')
            .setDescription('Creates (or edits) a reward with the specified parameters')
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
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Reward for the specified channel (leave empty for a global reward)')
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Deletes the specified reward')
            .addRoleOption(option => option
                .setName('reward-role')
                .setDescription('The role given as reward')
                .setRequired(true)
            )   
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Delete reward for the specified channel (leave empty for a global reward)')
                .addChannelTypes(ChannelType.GuildText)
            ) 
        )
    )
    .addSubcommandGroup(group => group
        .setName('infos')
        .setDescription('Infos about rewards')
        .addSubcommand(subcommand => subcommand
            .setName('overview')
            .setDescription('Shows you an overview of the rewards available')    
        )
        .addSubcommand(subcommand => subcommand
            .setName('find-by-role')
            .setDescription('Shows you if a reward exists for a role, and if so, its required number of message')
            .addRoleOption(option => option
                .setName('reward-role')
                .setDescription('Find a reward for this role')
                .setRequired(true)
            )
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    const rewardRole = interaction.options.getRole('reward-role')
    const requiredMessageCount = interaction.options.getInteger('number-of-required-messages')

    const channelId = interaction.options.getChannel('channel')?.id 

    switch (subcommand) {
        case 'create-or-edit':
            if (!rewardRole || !requiredMessageCount) return await replyError(interaction)
            createOrEditRewardCommand(interaction, rewardRole.id, requiredMessageCount, channelId)
            break
    
        case 'delete':
            if (!rewardRole) return await replyError(interaction)
            deleteRewardCommand(interaction, rewardRole.id, channelId)
            break

        case 'overview':
            overviewRewardsCommand(interaction)
            break

        case 'find-by-role':
            if (!rewardRole) return await replyError(interaction)
            findRewardByRoleCommand(interaction, rewardRole.id)
            break

        default:
            await replyError(interaction)
            break
    }
}



async function createOrEditRewardCommand(interaction: ChatInputCommandInteraction, rewardRoleId: Snowflake, requiredMessageCount: number, channelId?: string) {
    try {
        const success = await createOrEditReward(rewardRoleId, requiredMessageCount, channelId)
        if(!success) throw new Error('The reward could not be created or edited')
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }

    return await interaction.reply('✅ New reward was successfully created')
}
    
async function deleteRewardCommand(interaction: ChatInputCommandInteraction, rewardRoleId: Snowflake, channelId?: string) {
    try {
        const success = await deleteReward(rewardRoleId, channelId)
        if(!success) throw new Error('The reward could not be deleted')
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }

    return await interaction.reply('✅ Reward was successfully deleted')
}

async function overviewRewardsCommand(interaction: ChatInputCommandInteraction) {
    try {
        // TODO: Implement this.
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }
}

async function findRewardByRoleCommand(interaction: ChatInputCommandInteraction, rewardRoleId: Snowflake) {

    // TODO: update this so it works with channel specefic rewards

    try {
        const requiredMsgNb = getRequiredMessageCount(rewardRoleId)

        const message = (requiredMsgNb !== undefined && requiredMsgNb !== -1) ? 
            `The role <@&${rewardRoleId}> is earned after sending ${requiredMsgNb} messages` : 'There is no reward available for this role'

        return await interaction.reply(message)
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }
}