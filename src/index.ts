import fs from 'node:fs'
import path from 'node:path'

import { Client, GatewayIntentBits, Collection, SlashCommandBuilder, Interaction } from 'discord.js'
import config from '../config/config.json'

export const ephemeralAnswers: boolean = config.ephemeralAnswers

interface Command {
	data: SlashCommandBuilder,
	execute: (interaction: Interaction, ...args: any) => Promise<void>
}

declare module 'discord.js' {
	export interface Client {
	  	commands: Collection<string, Command>
	}
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command: Command = require(filePath)
	client.commands.set(command.data.name, command)
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file)
	const event = require(filePath)
	if (event.once) {
		client.once(event.data.name, (...args: any[]) => event.data.execute(...args))
	} else {
		client.on(event.data.name, (...args: any[]) => event.data.execute(...args))
	}
}

client.login(config.token)