const fs = require('node:fs/promises');

const numberOfSentMessagesDb = require('./number-of-sent-messages.json')
const rewardsDb = require('./rewards.json')

const save = (db) => new Promise(async (resolve, reject) => {
    let path = (db === numberOfSentMessagesDb) ? './database/number-of-sent-messages.json' : './database/rewards.json'
    try {
        await fs.writeFile(path, JSON.stringify(db, null, 4))
        resolve()
    } catch (error) {
        reject()
    }
})

function getNumberOfSentMessages(userId) {
    return numberOfSentMessagesDb[userId] || 0
}

async function editUser(userId, numberOfSentMessages = 0) {
    numberOfSentMessagesDb[userId.toString()] = +numberOfSentMessages
    await save(numberOfSentMessagesDb)
}

function getRewardRolesIds(numberOfSentMessages) {
    const rewards = []

    for (const [rewardRole, numberOfRequiredMessages] of Object.entries(rewardsDb)) {
        if (numberOfRequiredMessages <= numberOfSentMessages) rewards.push(rewardRole)
    }

    if (rewards.length === 0) return undefined

    return rewards
}

function getRequiredNumberOfMessages(roleId) {
    return rewardsDb[roleId]
}

async function createReward(rewardRoleId, numberOfRequiredMessages) {
    rewardsDb[rewardRoleId.toString()] = +numberOfRequiredMessages
    await save(rewardsDb)
}

module.exports = {
    getNumberOfSentMessages,
    editUser,
    getRewardRolesIds,
    getRequiredNumberOfMessages,
    createReward
}