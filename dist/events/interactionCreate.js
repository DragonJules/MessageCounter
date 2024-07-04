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
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                yield command.execute(interaction);
                console.log(`${interaction.user.tag} (${interaction.user.id}) in #${interaction.channel.name} (${(_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.id}) triggered an interaction (${interaction.commandName}).`);
            }
            catch (error) {
                console.error(error);
                yield interaction.reply({ content: 'An error occured while executing this command!', ephemeral: true });
            }
        }
    });
}
exports.data = {
    name: 'interactionCreate',
    execute
};
//# sourceMappingURL=interactionCreate.js.map