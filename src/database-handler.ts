import fs from 'node:fs/promises'
import { ChannelMessageCountMap, ChannelRewardsMap, Database, RewardDatabase, RewardMap, SentMessagesDatabase } from './types/database'
import { Snowflake } from 'discord.js'

import rewardsDbRaw from '../database/rewards.json'
import sentMessagesDbRaw from '../database/sent-messages.json'



const rewardsDatabase = new RewardDatabase(rewardsDbRaw, './database/rewards.json')
const sentMessagesDatabase = new SentMessagesDatabase(sentMessagesDbRaw, './database/sent-messages.json')


export function isChannelValid(channelId: Snowflake | undefined): boolean {
    if (!channelId) return false
    return rewardsDatabase.rewardChannels.has(channelId)
}

const save = (database: Database) => new Promise<boolean>(async (resolve, reject) => {
    try {
        await fs.writeFile(database.path, JSON.stringify(database.toJSON(), null, 4))

        resolve(true)
    } catch (error) {
        resolve(false)
    }
})

export function getUserInfos(userId: Snowflake): {
    global: number,
    byChannel: ChannelMessageCountMap
} {
    const user = sentMessagesDatabase.users.get(userId)

    return {
        global: user?.global || 0,
        byChannel: user?.byChannel || new Map()
    }
}

export function getUserMessageCount(userId: Snowflake, channelId?: Snowflake): number {
    if (!isChannelValid(channelId)) return sentMessagesDatabase.users.get(userId)?.global || 0

    return sentMessagesDatabase.users.get(userId)?.byChannel.get(channelId!) || 0 
}

export async function editUser(userId: Snowflake, messageCount: number, channelId?: Snowflake): Promise<boolean> {

    messageCount = Math.floor(messageCount)
    messageCount = Math.max(messageCount, 0)

    let user = sentMessagesDatabase.users.get(userId)
    if (!user) {
        sentMessagesDatabase.users.set(userId, {global: 0, byChannel: new Map()})
        user = sentMessagesDatabase.users.get(userId)!
    }
    if (isChannelValid(channelId)) {
        user.byChannel.set(channelId!, messageCount)
    }
    else {
        user.global = messageCount
    }

    return await save(sentMessagesDatabase)
}

export async function resetUser(userId: Snowflake): Promise<boolean> {
    sentMessagesDatabase.users.set(userId, {global: 0, byChannel: new Map()})
    return await save(sentMessagesDatabase)
}

export function getAllUsers(): Map<Snowflake, {
    global: number,
    byChannel: ChannelMessageCountMap
}> {
    return sentMessagesDatabase.users
}

export function getRewardRolesIds(currentMessageCount: number, channelId?: Snowflake): Snowflake[] {
    const rewards: Snowflake[] = []
    if (!isChannelValid(channelId)) {
        rewardsDatabase.global.forEach((requiredMessageCount, rewardRole) => {
            if (requiredMessageCount <= currentMessageCount) rewards.push(rewardRole)
        })

        return rewards
    }

    rewardsDatabase.byChannel.get(channelId!)?.forEach((requiredMessageCount, rewardRole) => {
        if (requiredMessageCount <= currentMessageCount) rewards.push(rewardRole)
    })

    return rewards
}

export function getRequiredMessageCount(roleId: Snowflake, channelId?: Snowflake): number | undefined {
    if (isChannelValid(channelId)) {
        return rewardsDatabase.byChannel.get(channelId!)?.get(roleId)
    }

    return rewardsDatabase.global.get(roleId)
}

export async function createOrEditReward(rewardRoleId: Snowflake, requiredMessageCount: number, channelId?: Snowflake): Promise<boolean> {
    if (channelId) {
        if (isChannelValid(channelId)) {
            rewardsDatabase.byChannel.get(channelId)?.set(rewardRoleId, requiredMessageCount)
        }
        else {
            rewardsDatabase.byChannel.set(channelId, new Map([[rewardRoleId, requiredMessageCount]]))
        }
    }
    else {
        rewardsDatabase.global.set(rewardRoleId, requiredMessageCount)
    }

    return await save(rewardsDatabase)
}

export async function deleteReward(roleId: Snowflake, channelId?: Snowflake): Promise<boolean> {
    let deleted: boolean | undefined
    if (isChannelValid(channelId)) {
        deleted = rewardsDatabase.byChannel.get(channelId!)?.delete(roleId)
        if (deleted && rewardsDatabase.byChannel.get(channelId!)?.size === 0) {
            deleted = rewardsDatabase.byChannel.delete(channelId!)
        }
    }
    else {
        deleted = rewardsDatabase.global.delete(roleId)
    }

    return (await save(rewardsDatabase)) && Boolean(deleted)
}

export function getAllRewards(): {
    global: RewardMap,
    byChannel: ChannelRewardsMap
} {
    return { 
        global: rewardsDatabase.global, 
        byChannel: rewardsDatabase.byChannel
    }
}
 