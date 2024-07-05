import { Snowflake } from "discord.js"

export interface DatabaseJSONBody {}

export class Database {
    public path: string

    public constructor (databaseRaw: DatabaseJSONBody, path: string) {
        this.path = path
    }
    
    public toJSON (): DatabaseJSONBody {
        return ''
    }
    
    protected parseRaw (databaseRaw: DatabaseJSONBody): unknown {
        return null
    }
}

export interface Reward {
    [roleId: Snowflake]: number
}
export type RewardMap = Map<Snowflake, number>

export interface ChannelRewards {
    [channelId: Snowflake]: Reward
}

export type ChannelRewardsMap = Map<Snowflake, RewardMap>

export interface RewardDatabaseJSONBody extends DatabaseJSONBody {
    global: Reward,
    byChannel: ChannelRewards
}

export class RewardDatabase extends Database {
    public global: RewardMap
    public byChannel: ChannelRewardsMap
    public rewardChannels: Set<Snowflake>
    
    public constructor (databaseRaw: RewardDatabaseJSONBody, path: string) {
        super(databaseRaw, path)

        const parsedRaw = this.parseRaw(databaseRaw)

        this.global = parsedRaw.global
        this.byChannel = parsedRaw.byChannel

        this.rewardChannels = new Set(this.byChannel.keys())
    }

    protected parseRaw(databaseRaw: RewardDatabaseJSONBody): {
        global: RewardMap,
        byChannel: ChannelRewardsMap
    } {
        const global = new Map(Object.entries(databaseRaw.global))
        const byChannel = new Map(Object.entries(databaseRaw.byChannel)
            .map(reward => [
                reward[0], 
                new Map(Object.entries(reward[1]))
            ])
        )
        return { global, byChannel }
    }

    public toJSON(): RewardDatabaseJSONBody {
        this.rewardChannels = new Set(this.byChannel.keys())

        const rewards: RewardDatabaseJSONBody = {
            global: {},
            byChannel: {}
        }

        this.global.forEach((requiredMessageCount, rewardRoleId) => {
            rewards.global[rewardRoleId] = requiredMessageCount
        })

        this.byChannel.forEach((channelRewards, channelId) => {
            rewards.byChannel[channelId] = {}
            channelRewards.forEach((requiredMessageCount, rewardRoleId) => {
                rewards.byChannel[channelId][rewardRoleId] = requiredMessageCount
            })
        })

        return rewards
    }
}

export interface ChannelMessageCount {
    [channelId: Snowflake]: number
}

export type ChannelMessageCountMap = Map<Snowflake, number>

export interface UserMessagesCount {
    global: number,
    byChannel: ChannelMessageCount
}

export interface SentMessagesDatabaseJSONBody extends DatabaseJSONBody {
    [userId: Snowflake]: UserMessagesCount
}

export class SentMessagesDatabase extends Database {
    public users: Map<Snowflake, {
        global: number,
        byChannel: ChannelMessageCountMap
    }>

    constructor (databaseRaw: SentMessagesDatabaseJSONBody, path: string) {
        super(databaseRaw, path)

        this.users = this.parseRaw(databaseRaw)
    }

    protected parseRaw(databaseRaw: SentMessagesDatabaseJSONBody): Map<Snowflake, {
        global: number,
        byChannel: ChannelMessageCountMap
    }> {
        return new Map(Object.entries(databaseRaw).map(user => [
            user[0],
            {
                global: user[1].global, 
                byChannel: new Map(Object.entries(user[1].byChannel))
            }
        ]))
    }

    public toJSON(): SentMessagesDatabaseJSONBody {
        const users: SentMessagesDatabaseJSONBody = {}

        this.users.forEach(({ global, byChannel }, userId) => {
            users[userId] = {
                global: global,
                byChannel: {}
            }

            byChannel.forEach((count, channelId) => {
                users[userId].byChannel[channelId] = count
            })
        })
   
        return users
    }
}

