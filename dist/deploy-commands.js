"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDeployCommands = appDeployCommands;
exports.appDeleteCommands = appDeleteCommands;
exports.guildDeployCommands = guildDeployCommands;
exports.guildDeleteCommands = guildDeleteCommands;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const rest_1 = require("@discordjs/rest");
const discord_js_1 = require("discord.js");
const config_json_1 = require("../config/config.json");
const commands = [];
const commandsPath = node_path_1.default.join(__dirname, 'commands');
const commandFiles = node_fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = node_path_1.default.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}
const rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.token);
function appDeployCommands() {
    rest.put(discord_js_1.Routes.applicationCommands(config_json_1.clientId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
function appDeleteCommands() {
    rest.put(discord_js_1.Routes.applicationCommands(config_json_1.clientId), { body: [] })
        .then(() => console.log('Successfully deleted application commands.'))
        .catch(console.error);
}
function guildDeployCommands(guildId) {
    rest.put(discord_js_1.Routes.applicationGuildCommands(config_json_1.clientId, guildId), { body: commands })
        .then(() => console.log('Successfully registered all guild commands.'))
        .catch(console.error);
}
function guildDeleteCommands(guildId) {
    rest.put(discord_js_1.Routes.applicationGuildCommands(config_json_1.clientId, guildId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);
}
const flag = process.argv[2];
const guildId = process.argv[3];
switch (flag) {
    case '/a':
        appDeployCommands();
        break;
    case '/ad':
        appDeleteCommands();
        break;
    case '/g':
        if (!guildId) {
            console.log("Please specify a guild id");
            break;
        }
        guildDeployCommands(guildId);
        break;
    case '/gd':
        if (!guildId) {
            console.log("Please specify a guild id");
            break;
        }
        guildDeleteCommands(guildId);
        break;
    default:
        console.log('Please specify one of these flags: \n\n    /a  : Deploy App Commands\n    /ad : Delete App Commands\n    /g  : Deploy Guild Commands\n    /gd : Delete Guild Commands\n');
}
//# sourceMappingURL=deploy-commands.js.map