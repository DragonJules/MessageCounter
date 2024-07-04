import { Interaction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'


export const data = new SlashCommandBuilder()
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
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('number-of-sent-messages')
                .setDescription('The number of sent messages to set')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Set number of sent messages in the specified channel. (leave empty to edit global amount)')
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Resets the number of sent messages')
            .addUserOption(option => option
                .setName('target-user')
                .setDescription('The user to reset')
                .setRequired(true)
            )
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('Reset number of sent messages in the specified channel. (leave empty to reset globaly)')
            )
        )
    )
    .addSubcommandGroup(group => group
        .setName('infos')
        .setDescription('Infos about sent messages')
        .addSubcommand(subcommand => subcommand
            .setName('by-user')
            .setDescription('Shows you how many message a user sent')
            .addUserOption(option => option
                .setName('target-user')
                .setDescription('Show number of messages of the user')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('average')
            .setDescription('Shows you the average number of messages sent by active users')    
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)

export async function execute(interaction: Interaction) {
    //TODO: Implement everything.
}
