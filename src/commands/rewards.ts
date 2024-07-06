import { SlashCommandBuilder, PermissionFlagsBits, Interaction, CommandInteraction, ChatInputCommandInteraction, Snowflake, ChannelType } from 'discord.js'
import { getRequiredMessageCount, getAllRewards, deleteReward, createOrEditReward, isChannelValid } from '../database-handler.js'
import { replyError } from '../util/reply-error.js'
import { RewardMap } from '../types/database.js'
import { ephemeralAnswers } from '../index.js'

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
                .setDescription('The role given as reward for a message count')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('required-message-count')
                .setDescription('The required message count to get the reward')
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
            .setDescription('Shows you if a reward exists for a role, and if so, its required message count')
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
    const requiredMessageCount = interaction.options.getInteger('required-message-count')

    const channelId = interaction.options.getChannel('channel')?.id 

    let response: string

    try {    
        switch (subcommand) {
            case 'create-or-edit':
                if (!rewardRole || !requiredMessageCount) throw new Error('Missing arguments')
                response = await createOrEditRewardCommand(rewardRole.id, requiredMessageCount, channelId)
                break
        
            case 'delete':
                if (!rewardRole) throw new Error('Missing arguments')
                response = await deleteRewardCommand(rewardRole.id, channelId)
                break

            case 'overview':
                response = await overviewRewardsCommand()
                break

            case 'find-by-role':
                if (!rewardRole) throw new Error('Missing arguments')
                response = await findRewardByRoleCommand(rewardRole.id, channelId)
                break

            default:
                throw new Error(`Unknown command: ${subcommand}`)
        }
    }
    catch (err) {
        console.error(err)
        return await replyError(interaction)
    }

    if(!response.length) return await replyError(interaction) 
    interaction.reply({ content: response, ephemeral: ephemeralAnswers })
}



async function createOrEditRewardCommand(rewardRoleId: Snowflake, requiredMessageCount: number, channelId?: string): Promise<string> {
    const success = await createOrEditReward(rewardRoleId, requiredMessageCount, channelId)
    if(!success) throw new Error('The reward could not be created or edited')

    return '✅ Reward was successfully created/edited'
}
    
async function deleteRewardCommand(rewardRoleId: Snowflake, channelId?: string): Promise<string> {
    const success = await deleteReward(rewardRoleId, channelId)
    if(!success) throw new Error('The reward could not be deleted')
    
    return '✅ Reward was successfully deleted'
}

function getRewardsTextArray(rewards: RewardMap): string[] {
    return Array.from(rewards.entries()).map(reward => `* <@&${reward[0]}> : ${reward[1]}`)
}

async function overviewRewardsCommand(): Promise<string> {
    const rewards = getAllRewards()
    
    const globalRewardsTextArray = getRewardsTextArray(rewards.global)
    const globalRewardsText = globalRewardsTextArray.length ? globalRewardsTextArray.join('\n') : '*No reward*'

    const channelRewardsTextArray = Array.from(rewards.byChannel.entries()).map(channelRewards => `* <#${channelRewards[0]}> :\n ${getRewardsTextArray(channelRewards[1]).join('\n ')}`)
    const channelRewardsText = channelRewardsTextArray.length ? channelRewardsTextArray.join('\n') : '*No reward*'

    const message = `## Rewards Overview \n\`@role : required message count\`\n### Global : \n${globalRewardsText}\n### By Channel : \n${channelRewardsText}`

    return message
}

async function findRewardByRoleCommand(rewardRoleId: Snowflake, channelId?: Snowflake): Promise<string> {
    const requiredMessageCount = getRequiredMessageCount(rewardRoleId, channelId)

    const channelIsValid = isChannelValid(channelId)
    const channelSpecificText = channelIsValid ? `in channel <#${channelId}>` : ''

    const message = (requiredMessageCount) ? 
        `The role <@&${rewardRoleId}> is earned after sending **${requiredMessageCount}** messages ${channelSpecificText}` :`There is no ${channelId ? `<#${channelId}> specific` : 'global'} reward with this role`

    return message
}