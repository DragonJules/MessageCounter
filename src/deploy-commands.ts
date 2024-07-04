import fs from 'node:fs'
import path from 'node:path'
import { REST } from '@discordjs/rest'
import { RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder, Snowflake } from 'discord.js'
import { clientId, token } from '../config/config.json'

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	commands.push((command.data as SlashCommandBuilder).toJSON())
}

const rest = new REST({ version: '10' }).setToken(token)

function appDeployCommands()  {
	rest.put(Routes.applicationCommands(clientId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error)
}
function appDeleteCommands() {
	rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted application commands.'))
	.catch(console.error)
}
function guildDeployCommands(guildId: Snowflake) {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered all guild commands.'))
		.catch(console.error)
}
function guildDeleteCommands(guildId: Snowflake) {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error)
}

export {
	appDeployCommands,
	appDeleteCommands,
	guildDeployCommands,
	guildDeleteCommands
}

const flag = process.argv[2]
const guildId = process.argv[3]
switch (flag) {
	case '/a':
		appDeployCommands()
		break

	case '/ad':
		appDeleteCommands()
		break

	case '/g':
		if (!guildId) {
			console.log("Please specify a guild id")
			break
		}
		guildDeployCommands(guildId)
		break 
		
	case '/gd':
		if (!guildId) {
			console.log("Please specify a guild id")
			break
		}
		guildDeleteCommands(guildId)
		break 

	default:
		console.log('Please specify one of these flags: \n\n    /a  : Deploy App Commands\n    /ad : Delete App Commands\n    /g  : Deploy Guild Commands\n    /gd : Delete Guild Commands\n')
}

