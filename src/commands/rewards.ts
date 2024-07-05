import { SlashCommandBuilder, PermissionFlagsBits, Interaction, CommandInteraction, ChatInputCommandInteraction, Snowflake, ChannelType } from 'discord.js'
import { getRequiredMessageCount, getAllRewards, deleteReward, createOrEditReward, isChannelValid } from '../database-handler.js'
import { replyError } from '../util/reply-error.js'
import { RewardMap } from '../types/database.js'

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
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Delete reward for the specified channel (leave empty for a global reward)')
                .addChannelTypes(ChannelType.GuildText)
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
            findRewardByRoleCommand(interaction, rewardRole.id, channelId)
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

    return await interaction.reply('✅ Reward was successfully created/edited')
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

function getRewardsTextArray(rewards: RewardMap): string[] {
    return Array.from(rewards.entries()).map(reward => `* <@&${reward[0]}> : ${reward[1]}`)
}

async function overviewRewardsCommand(interaction: ChatInputCommandInteraction) {
    try {
        const rewards = getAllRewards()
        
        const globalRewardsTextArray = getRewardsTextArray(rewards.global)
        const globalRewardsText = globalRewardsTextArray.length ? globalRewardsTextArray.join('\n') : '*No reward*'

        const channelRewardsTextArray = Array.from(rewards.byChannel.entries()).map(channelRewards => `* <#${channelRewards[0]}> :\n ${getRewardsTextArray(channelRewards[1]).join('\n ')}`)
        const channelRewardsText = channelRewardsTextArray.length ? channelRewardsTextArray.join('\n') : '*No reward*'

        const message = `## Rewards Overview \n\`@role : required message count\`\n### Global : \n${globalRewardsText}\n### By Channel : \n${channelRewardsText}`

        interaction.reply(message)
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }
}

async function findRewardByRoleCommand(interaction: ChatInputCommandInteraction, rewardRoleId: Snowflake, channelId?: Snowflake) {
    try {
        const requiredMessageCount = getRequiredMessageCount(rewardRoleId, channelId)

        const channelIsValid = isChannelValid(channelId)
        const channelSpecificText = channelIsValid ? `in channel <#${channelId}>` : ''

        const message = (requiredMessageCount) ? 
            `The role <@&${rewardRoleId}> is earned after sending **${requiredMessageCount}** messages ${channelSpecificText}` :`There is no ${channelId ? `<#${channelId}> specific` : 'global'} reward with this role`

        return await interaction.reply(message)
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }
}