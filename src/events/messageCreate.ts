import { Collection, GuildMember, Message, Role, Snowflake } from 'discord.js'
import { editUser, getRewardRolesIds, getUserMessageCount, isChannelValid } from '../database-handler.js'

export const data = {
	name: 'messageCreate',
	async execute(message: Message) {
        if (message.content.length < 4) return        
    
		const member = message.member
        if (!member || member.user.bot) return
        
        const channelId = message.channelId
        const channelIsValid = isChannelValid(channelId)

        const [userEdited, messageCount, channelMessageCount] = await editUserMessageCount(member.id, channelId, channelIsValid)

        if (!userEdited) return console.error(`An error has occurred: Member <${member.id}> has not been edited (messageCount: ${messageCount}; channel: <${channelId}>; channelValid: ${channelIsValid})`)
 
        let rewardRolesIds: Snowflake[] = getRewards(messageCount, channelMessageCount, channelId, channelIsValid)
        if (rewardRolesIds.length === 0) return 

        const givenRoles = await giveRoles(member, rewardRolesIds)
        await message.reply(`You earned ${givenRoles.map(role => `<@&${role.id}>`).join(', ')}`)
    },
}

async function editUserMessageCount(memberId: Snowflake, channelId: Snowflake, channelIsValid: boolean): Promise<[boolean, number, number | undefined]> {
    const messageCount = getUserMessageCount(memberId)+1

    let userEdited = await editUser(memberId, messageCount)

    let channelMessageCount = undefined
    if (channelIsValid) {
        channelMessageCount = getUserMessageCount(memberId, channelId)+1
        userEdited = userEdited && await editUser(memberId, channelMessageCount, channelId)  
    }

    return [userEdited, messageCount, channelMessageCount]
}

function getRewards(messageCount: number, channelMessageCount: number | undefined, channelId: Snowflake, channelIsValid: boolean): Snowflake[] {
    const globalRewardRolesIds = getRewardRolesIds(messageCount)

    let channelRewardRolesIds: Snowflake[] = []
    if (channelIsValid && channelMessageCount) {
        channelRewardRolesIds = getRewardRolesIds(channelMessageCount, channelId)
    }

    return globalRewardRolesIds.concat(channelRewardRolesIds)
}

async function giveRoles(member: GuildMember, rewardRolesIds: Snowflake[]): Promise<Collection<string, Role>> {
    const memberRoles = member.roles
    const previousMemberRoles = memberRoles.cache.clone()

    const newMemberRoles = (await memberRoles.add(rewardRolesIds)).roles.cache.clone()

    const givenRoles = newMemberRoles.filter(role => !previousMemberRoles.has(role.id))

    return givenRoles
}