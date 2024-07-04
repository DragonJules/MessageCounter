import { BaseGuildTextChannel, Interaction } from "discord.js"

async function execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) return

        try {
            await command.execute(interaction)
            console.log(`${interaction.user.tag} (${interaction.user.id}) in #${(interaction.channel as BaseGuildTextChannel).name} (${interaction.channel?.id}) triggered an interaction (${interaction.commandName}).`)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: 'An error occured while executing this command!', ephemeral: true })
        }
    }
}

export const data = {
	name: 'interactionCreate',
    execute
}