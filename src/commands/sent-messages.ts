import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, Snowflake } from 'discord.js'
import { editUser, getAllUsers, getUserInfos, getUserMessageCount, isChannelValid, resetUser } from '../database-handler.js'
import { ephemeralAnswers } from '../index.js'
import { replyError } from '../util/reply-error.js'


export const data = new SlashCommandBuilder()
    .setName('sent-messages')
    .setDescription('Manage sent messages or get information about them')
    .addSubcommandGroup(group => group
        .setName('manage')
        .setDescription('Manages the sent messages')    
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Sets the message count')
            .addUserOption(option => option
                .setName('target-user')
                .setDescription('The user to edit')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('message-count')
                .setDescription('The message count to set')
                .setRequired(true)
                .setMinValue(0)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Set message count in the specified channel. (leave empty to edit global count)')
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Resets the message count')
            .addUserOption(option => option
                .setName('target-user')
                .setDescription('The user to reset')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Reset message count in the specified channel. (leave empty to reset globaly)')
                .addChannelTypes(ChannelType.GuildText)
            )
        )
    )
    .addSubcommandGroup(group => group
        .setName('infos')
        .setDescription('Infos about sent messages')
        .addSubcommand(subcommand => subcommand
            .setName('by-user')
            .setDescription('Shows you how many message a user sent')
            .addUserOption(option => option
                .setName('target-user')
                .setDescription('Show message count of the specified user')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('average')
            .setDescription('Shows you the average message count of active users')   
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Average message count in the specified channel. (leave empty for a global average)')
                .addChannelTypes(ChannelType.GuildText)
            ) 
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()

    const targetUserId = interaction.options.getUser('target-user')?.id
    const messageCount = interaction.options.getInteger('message-count')

    const channelId = interaction.options.getChannel('channel')?.id 

    let response: string

    try {    
        switch (subcommand) {
            case 'set':
                if (!targetUserId || !messageCount || messageCount < 0) throw new Error('Missing arguments')
                response = await setUserMessageCountCommand(targetUserId, messageCount, channelId)
                break

            case 'reset':
                if (!targetUserId) throw new Error('Missing arguments')
                response = await resetUserCommand(targetUserId, channelId)
                break

            case 'by-user':
                if (!targetUserId) throw new Error('Missing arguments')
                response = userInfoCommand(targetUserId)
                break

            case 'average':
                response = await averageMessageCountCommand(channelId)
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

async function setUserMessageCountCommand(userId: Snowflake, messageCount: number, channelId?: Snowflake): Promise<string> {
    const channelIsValid = isChannelValid(channelId)
    
    if (!channelIsValid && messageCount === 0) return await resetUserCommand(userId)
    
    let success : boolean

    if (channelIsValid) {
        const globalMessageCount = getUserMessageCount(userId)
        const channelMessageCount = getUserMessageCount(userId, channelId)
        
        success = await editUser(userId, messageCount, channelId)
        success = success && await editUser(userId, globalMessageCount - channelMessageCount + messageCount)
    }
    else {
        success = await editUser(userId, messageCount)
    }

    if(!success) throw new Error('The user could not be edited')
    
    return '✅ User was successfully edited'
}

async function resetUserCommand(userId: Snowflake, channelId?: Snowflake): Promise<string> {
    let success: boolean
    if (isChannelValid(channelId)) {
        const globalMessageCount = getUserMessageCount(userId)
        const channelMessageCount = getUserMessageCount(userId, channelId)
        
        success = await editUser(userId, 0, channelId)
        success = success && await editUser(userId, globalMessageCount - channelMessageCount)
    }
    else {
        success = await resetUser(userId)
    }

    if(!success) throw new Error('The user could not be edited')

    return '✅ User was successfully reseted'
}

function userInfoCommand(userId: Snowflake): string {
    const user = getUserInfos(userId)
    
    const channelMessageCountsTextArray = Array.from(user.byChannel.entries()).map(channelMessageCount => `* <#${channelMessageCount[0]}> : ${channelMessageCount[1]} messages sent`)
    const channelMessageCounts = channelMessageCountsTextArray.length ? channelMessageCountsTextArray.join('\n') : '*No channel specific message count*'

    const message = `## User Infos \n### Global : \n${user.global} messages sent\n### By Channel : \n${channelMessageCounts}`

    return message
}

const average = (list: number[]) => list.reduce((prev, curr) => prev + curr) / list.length;

async function averageMessageCountCommand(channelId?: Snowflake): Promise<string> {
    const users = getAllUsers()
    const channelIsValid = isChannelValid(channelId)

    let averageMessageCount: number

    if (channelIsValid) {
        const channelMessageCounts: number[] = []
        users.forEach(user => {
            const channelMessageCount = user.byChannel.get(channelId!)
            if (channelMessageCount) channelMessageCounts.push(channelMessageCount)
            
        })

        averageMessageCount = average(channelMessageCounts)
    }
    else {
        const messageCounts: number[] = []
        users.forEach(user => {
            const messageCount = user.global
            if (messageCount) messageCounts.push(messageCount)
        })

        averageMessageCount = average(messageCounts)
    }

    averageMessageCount = Math.floor(averageMessageCount)

    const channelSpecificText = channelIsValid ? `in channel <#${channelId}>` : ''
    const message = `On average, active users sent ${averageMessageCount} messages ${channelSpecificText}`

    return message
}