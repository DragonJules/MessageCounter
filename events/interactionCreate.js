async function execute(interaction) {
    if (interaction.isUserContextMenuCommand()) {
        const { commands } = interaction.client
        const { commandName } = interaction
        const contextCommand = commands.get(commandName)

        if (!contextCommand) return;

        try {
            await contextCommand.execute(interaction)
        } catch (error) {
            console.log(error);
        }
    }


    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return

        try {
            await command.execute(interaction);
            console.log(`${interaction.user.tag} (${interaction.user.id}) in #${interaction.channel.name} (${interaction.channel.id}) triggered an interaction (${interaction.commandName}).`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occured while executing this command!', ephemeral: true });
        }
    }

}


module.exports = {
	name: 'interactionCreate',
    execute: execute
};