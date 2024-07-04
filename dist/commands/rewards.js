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
exports.execute = execute;
const discord_js_1 = require("discord.js");
const database_handler_js_1 = require("../database-handler.js");
const reply_error_js_1 = require("../util/reply-error.js");
exports.data = new discord_js_1.SlashCommandBuilder()
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
    .setDescription('The role given as reward for number of sent messages')
    .setRequired(true))
    .addIntegerOption(option => option
    .setName('number-of-required-messages')
    .setDescription('The number of messages that should be sent to get the reward')
    .setRequired(true))
    .addChannelOption(option => option
    .setName('channel')
    .setDescription('Reward for the specified channel (leave empty for a global reward)')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)))
    .addSubcommand(subcommand => subcommand
    .setName('delete')
    .setDescription('Deletes the specified reward')
    .addRoleOption(option => option
    .setName('reward-role')
    .setDescription('The role given as reward')
    .setRequired(true))
    .addChannelOption(option => option
    .setName('channel')
    .setDescription('Delete reward for the specified channel (leave empty for a global reward)')
    .addChannelTypes(discord_js_1.ChannelType.GuildText))))
    .addSubcommandGroup(group => group
    .setName('infos')
    .setDescription('Infos about rewards')
    .addSubcommand(subcommand => subcommand
    .setName('overview')
    .setDescription('Shows you an overview of the rewards available'))
    .addSubcommand(subcommand => subcommand
    .setName('find-by-role')
    .setDescription('Shows you if a reward exists for a role, and if so, its required number of message')
    .addRoleOption(option => option
    .setName('reward-role')
    .setDescription('Find a reward for this role')
    .setRequired(true))))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false);
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const subcommand = interaction.options.getSubcommand();
        const rewardRole = interaction.options.getRole('reward-role');
        const requiredMessageCount = interaction.options.getInteger('number-of-required-messages');
        const channelId = (_a = interaction.options.getChannel('channel')) === null || _a === void 0 ? void 0 : _a.id;
        switch (subcommand) {
            case 'create-or-edit':
                if (!rewardRole || !requiredMessageCount)
                    return yield (0, reply_error_js_1.replyError)(interaction);
                createOrEditRewardCommand(interaction, rewardRole.id, requiredMessageCount, channelId);
                break;
            case 'delete':
                if (!rewardRole)
                    return yield (0, reply_error_js_1.replyError)(interaction);
                deleteRewardCommand(interaction, rewardRole.id, channelId);
                break;
            case 'overview':
                overviewRewardsCommand(interaction);
                break;
            case 'find-by-role':
                if (!rewardRole)
                    return yield (0, reply_error_js_1.replyError)(interaction);
                findRewardByRoleCommand(interaction, rewardRole.id);
                break;
            default:
                yield (0, reply_error_js_1.replyError)(interaction);
                break;
        }
    });
}
function createOrEditRewardCommand(interaction, rewardRoleId, requiredMessageCount, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const success = yield (0, database_handler_js_1.createOrEditReward)(rewardRoleId, requiredMessageCount, channelId);
            if (!success)
                throw new Error('The reward could not be created or edited');
        }
        catch (err) {
            console.error(err);
            return yield (0, reply_error_js_1.replyError)(interaction);
        }
        return yield interaction.reply('✅ New reward was successfully created');
    });
}
function deleteRewardCommand(interaction, rewardRoleId, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const success = yield (0, database_handler_js_1.deleteReward)(rewardRoleId, channelId);
            if (!success)
                throw new Error('The reward could not be deleted');
        }
        catch (err) {
            console.error(err);
            return yield (0, reply_error_js_1.replyError)(interaction);
        }
        return yield interaction.reply('✅ Reward was successfully deleted');
    });
}
function overviewRewardsCommand(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Implement this.
        }
        catch (err) {
            console.error(err);
            return yield (0, reply_error_js_1.replyError)(interaction);
        }
    });
}
function findRewardByRoleCommand(interaction, rewardRoleId) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: update this so it works with channel specefic rewards
        try {
            const requiredMsgNb = (0, database_handler_js_1.getRequiredMessageCount)(rewardRoleId);
            const message = (requiredMsgNb !== undefined && requiredMsgNb !== -1) ?
                `The role <@&${rewardRoleId}> is earned after sending ${requiredMsgNb} messages` : 'There is no reward available for this role';
            return yield interaction.reply(message);
        }
        catch (err) {
            console.error(err);
            return yield (0, reply_error_js_1.replyError)(interaction);
        }
    });
}
//# sourceMappingURL=rewards.js.map