"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChannelValid = isChannelValid;
exports.getUserMessageCount = getUserMessageCount;
exports.editUser = editUser;
exports.getRewardRolesIds = getRewardRolesIds;
exports.getRequiredMessageCount = getRequiredMessageCount;
exports.createOrEditReward = createOrEditReward;
exports.deleteReward = deleteReward;
exports.getAllRewards = getAllRewards;
const promises_1 = __importDefault(require("node:fs/promises"));
const database_1 = require("./types/database");
const rewards_json_1 = __importDefault(require("../database/rewards.json"));
const sent_messages_json_1 = __importDefault(require("../database/sent-messages.json"));
const rewardsDatabase = new database_1.RewardDatabase(rewards_json_1.default, './database/rewards.json');
const sentMessagesDatabase = new database_1.SentMessagesDatabase(sent_messages_json_1.default, './database/sent-messages.json');
function isChannelValid(channelId) {
    if (!channelId)
        return false;
    return rewardsDatabase.rewardChannels.has(channelId);
}
const save = (database) => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield promises_1.default.writeFile(database.path, JSON.stringify(database.toJSON(), null, 4));
        resolve(true);
    }
    catch (error) {
        resolve(false);
    }
}));
function getUserMessageCount(userId, channelId) {
    var _a, _b;
    if (!isChannelValid(channelId))
        return ((_a = sentMessagesDatabase.users.get(userId)) === null || _a === void 0 ? void 0 : _a.global) || 0;
    return ((_b = sentMessagesDatabase.users.get(userId)) === null || _b === void 0 ? void 0 : _b.byChannel.get(channelId)) || 0;
}
function editUser(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, messageCount = 0, channelId) {
        let user = sentMessagesDatabase.users.get(userId);
        if (!user) {
            sentMessagesDatabase.users.set(userId, { global: 0, byChannel: new Map() });
            user = sentMessagesDatabase.users.get(userId);
        }
        if (isChannelValid(channelId)) {
            user.byChannel.set(channelId, messageCount);
        }
        else {
            user.global = messageCount;
        }
        return yield save(sentMessagesDatabase);
    });
}
function getRewardRolesIds(currentMessageCount, channelId) {
    var _a;
    const rewards = [];
    if (!isChannelValid(channelId)) {
        rewardsDatabase.global.forEach((requiredMessageCount, rewardRole) => {
            if (requiredMessageCount <= currentMessageCount)
                rewards.push(rewardRole);
        });
        return rewards;
    }
    (_a = rewardsDatabase.byChannel.get(channelId)) === null || _a === void 0 ? void 0 : _a.forEach((requiredMessageCount, rewardRole) => {
        if (requiredMessageCount <= currentMessageCount)
            rewards.push(rewardRole);
    });
    return rewards;
}
function getRequiredMessageCount(roleId) {
    let requiredMessageCount = rewardsDatabase.global.get(roleId);
    if (requiredMessageCount)
        return requiredMessageCount;
    rewardsDatabase.byChannel.forEach(rewards => {
        requiredMessageCount = rewards.get(roleId);
    });
    return requiredMessageCount;
}
function createOrEditReward(rewardRoleId, requiredMessageCount, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (channelId) {
            rewardsDatabase.byChannel.set(channelId, new Map([[rewardRoleId, requiredMessageCount]]));
        }
        else {
            rewardsDatabase.global.set(rewardRoleId, requiredMessageCount);
        }
        return yield save(rewardsDatabase);
    });
}
function deleteReward(roleId, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let deleted;
        if (isChannelValid(channelId)) {
            deleted = (_a = rewardsDatabase.byChannel.get(channelId)) === null || _a === void 0 ? void 0 : _a.delete(roleId);
        }
        else {
            deleted = rewardsDatabase.global.delete(roleId);
        }
        return (yield save(rewardsDatabase)) && Boolean(deleted);
    });
}
function getAllRewards() {
    return {
        global: rewardsDatabase.global,
        byChannel: rewardsDatabase.byChannel
    };
}
//# sourceMappingURL=database-handler.js.map