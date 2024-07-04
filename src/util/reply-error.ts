import { BooleanCache, CacheType, ChatInputCommandInteraction, InteractionResponse } from "discord.js"

export async function replyError(interaction: ChatInputCommandInteraction, message?: string): Promise<InteractionResponse<BooleanCache<CacheType>>> {
    const defaultErrorMessage = '❌ Something went wrong'
    const errorMessage = message ? `${defaultErrorMessage}: ${message}` : defaultErrorMessage
    return await interaction.reply(errorMessage)
}