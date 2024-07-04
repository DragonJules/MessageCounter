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
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
const database_handler_js_1 = require("../database-handler.js");
exports.data = {
    name: 'messageCreate',
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.content.length < 4)
                return;
            const member = message.member;
            if (!member || member.user.bot)
                return;
            const channelId = message.channelId;
            const channelIsValid = (0, database_handler_js_1.isChannelValid)(channelId);
            const [userEdited, messageCount, channelMessageCount] = yield editUserMessageCount(member.id, channelId, channelIsValid);
            if (!userEdited)
                return console.error(`An error has occurred: Member <${member.id}> has not been edited (messageCount: ${messageCount}; channel: <${channelId}>; channelValid: ${channelIsValid})`);
            let rewardRolesIds = getRewards(messageCount, channelMessageCount, channelId, channelIsValid);
            if (rewardRolesIds.length === 0)
                return;
            const givenRoles = yield giveRoles(member, rewardRolesIds);
            yield message.reply(`You earned ${givenRoles.map(role => `<@&${role.id}>`).join(', ')}`);
        });
    },
};
function editUserMessageCount(memberId, channelId, channelIsValid) {
    return __awaiter(this, void 0, void 0, function* () {
        const messageCount = (0, database_handler_js_1.getUserMessageCount)(memberId) + 1;
        let userEdited = yield (0, database_handler_js_1.editUser)(memberId, messageCount);
        let channelMessageCount = undefined;
        if (channelIsValid) {
            channelMessageCount = (0, database_handler_js_1.getUserMessageCount)(memberId, channelId) + 1;
            userEdited = userEdited && (yield (0, database_handler_js_1.editUser)(memberId, channelMessageCount, channelId));
        }
        return [userEdited, messageCount, channelMessageCount];
    });
}
function getRewards(messageCount, channelMessageCount, channelId, channelIsValid) {
    const globalRewardRolesIds = (0, database_handler_js_1.getRewardRolesIds)(messageCount);
    let channelRewardRolesIds = [];
    if (channelIsValid && channelMessageCount) {
        channelRewardRolesIds = (0, database_handler_js_1.getRewardRolesIds)(channelMessageCount, channelId);
    }
    return globalRewardRolesIds.concat(channelRewardRolesIds);
}
function giveRoles(member, rewardRolesIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const memberRoles = member.roles;
        const previousMemberRoles = memberRoles.cache.clone();
        const newMemberRoles = (yield memberRoles.add(rewardRolesIds)).roles.cache.clone();
        const givenRoles = newMemberRoles.filter(role => !previousMemberRoles.has(role.id));
        return givenRoles;
    });
}
//# sourceMappingURL=messageCreate.js.map