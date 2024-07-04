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
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('sent-messages')
    .setDescription('Manage sent messages or get information about them')
    .addSubcommandGroup(group => group
    .setName('manage')
    .setDescription('Manages the sent messages')
    .addSubcommand(subcommand => subcommand
    .setName('set')
    .setDescription('Sets the number of sent messages')
    .addUserOption(option => option
    .setName('target-user')
    .setDescription('The user to edit')
    .setRequired(true))
    .addIntegerOption(option => option
    .setName('number-of-sent-messages')
    .setDescription('The number of sent messages to set')
    .setRequired(true))
    .addChannelOption(option => option
    .setName('channel')
    .setDescription('Set number of sent messages in the specified channel. (leave empty to edit global amount)')))
    .addSubcommand(subcommand => subcommand
    .setName('reset')
    .setDescription('Resets the number of sent messages')
    .addUserOption(option => option
    .setName('target-user')
    .setDescription('The user to reset')
    .setRequired(true))
    .addChannelOption(option => option
    .setName('channel')
    .setDescription('Reset number of sent messages in the specified channel. (leave empty to reset globaly)'))))
    .addSubcommandGroup(group => group
    .setName('infos')
    .setDescription('Infos about sent messages')
    .addSubcommand(subcommand => subcommand
    .setName('by-user')
    .setDescription('Shows you how many message a user sent')
    .addUserOption(option => option
    .setName('target-user')
    .setDescription('Show number of messages of the user')
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName('average')
    .setDescription('Shows you the average number of messages sent by active users')))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false);
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
//# sourceMappingURL=sent-messages.js.map