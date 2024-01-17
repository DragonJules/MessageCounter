const { editUser, getRewardRolesIds, getNumberOfSentMessages } = require('../database/database-handler')

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		const member = message.member
        if (member.user.bot) return
        const numberOfSentMessages = getNumberOfSentMessages(member.id)+1

        await editUser(member.id, numberOfSentMessages)

        const rewardRolesIds = getRewardRolesIds(numberOfSentMessages)
        if (!rewardRolesIds) return 

        const memberRoles = member.roles
        let memberRolesIds
        let givenRolesIds
        if (memberRoles.cache.length !== 0) {
            memberRolesIds = Array.from(memberRoles.cache)
            givenRolesIds = rewardRolesIds.filter(roleId => !zArray.from(memberRoles.cache).map(role => role[0]).includes(roleId)) 
        }
        
        if (givenRolesIds && givenRolesIds.length === 0) return 

        for (const roleId of givenRolesIds || rewardRolesIds) {
            await memberRoles.add(roleId)
        }
        await message.reply(`You earned ${(givenRolesIds || rewardRolesIds).map(roleId => `<@&${roleId}>`)}, because you sent ${numberOfSentMessages} messages`)
    },
};