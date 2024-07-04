"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentMessagesDatabase = exports.RewardDatabase = exports.Database = void 0;
class Database {
    constructor(databaseRaw, path) {
        this.path = path;
    }
    toJSON() {
        return '';
    }
    parseRaw(databaseRaw) {
        return null;
    }
}
exports.Database = Database;
class RewardDatabase extends Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        const parsedRaw = this.parseRaw(databaseRaw);
        this.global = parsedRaw.global;
        this.byChannel = parsedRaw.byChannel;
        this.rewardChannels = new Set(this.byChannel.keys());
    }
    parseRaw(databaseRaw) {
        const global = new Map(Object.entries(databaseRaw.global));
        const byChannel = new Map(Object.entries(databaseRaw.byChannel)
            .map(reward => [
            reward[0],
            new Map(Object.entries(reward[1]))
        ]));
        return { global, byChannel };
    }
    toJSON() {
        this.rewardChannels = new Set(this.byChannel.keys());
        const rewards = {
            global: {},
            byChannel: {}
        };
        this.global.forEach((requiredMessageCount, rewardRoleId) => {
            rewards.global[rewardRoleId] = requiredMessageCount;
        });
        this.byChannel.forEach((channelRewards, channelId) => {
            channelRewards.forEach((requiredMessageCount, rewardRoleId) => {
                rewards.byChannel[channelId] = {};
                rewards.byChannel[channelId][rewardRoleId] = requiredMessageCount;
            });
        });
        return rewards;
    }
}
exports.RewardDatabase = RewardDatabase;
class SentMessagesDatabase extends Database {
    constructor(databaseRaw, path) {
        super(databaseRaw, path);
        this.users = this.parseRaw(databaseRaw);
    }
    parseRaw(databaseRaw) {
        return new Map(Object.entries(databaseRaw).map(user => [
            user[0],
            {
                global: user[1].global,
                byChannel: new Map(Object.entries(user[1].byChannel))
            }
        ]));
    }
    toJSON() {
        const users = {};
        this.users.forEach(({ global, byChannel }, userId) => {
            users[userId] = {
                global: global,
                byChannel: {}
            };
            byChannel.forEach((count, channelId) => {
                users[userId].byChannel[channelId] = count;
            });
        });
        return users;
    }
}
exports.SentMessagesDatabase = SentMessagesDatabase;
//# sourceMappingURL=database.js.map