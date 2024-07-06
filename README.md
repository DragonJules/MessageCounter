# Message Counter Discord Bot

## Description
### Features
This bot has been created to fit the needs of the person who asked me to create it, here there are:
* Count the number of messages sent by users in the server
* Give rewards for certain messages counts
* Having rewards given for a certain message count in a specific channel
* Being able to edit rewards, as well as users' message counts.
* Being able to visualize those informations

### Commands
There are two commands, both with several subcommands:
* `/rewards` - Manage rewards or get information about them
  * `manage` - Manage rewards
    * `create-or-edit` - Creates (or edits) a reward with the specified parameters <br>
      `@param reward-role` - The role given as reward for a message count <br>
      `@param required-message-count` - The required message count to get the reward <br>
      `@param channel` - Optional. Reward for the specified channel (leave empty for a global reward) <br>

    * `delete` - Deletes the specified reward <br>
      `@param reward-role` - The role given as reward <br>
      `@param channel` - Optional. Delete reward for the specified channel (leave empty for a global reward) <br>
 
  * `infos` - Infos about rewards
    * `find-by-role` - Shows you if a reward exists for a role, and if so, its required message count <br>
      `@param reward-role` - Find a reward for this role <br>
      `@param channel` - Optional. Delete reward for the specified channel (leave empty for a global reward) <br>

    * `overview` - Shows you an overview of the rewards available
  
* `/sent-messages` - Manage sent messages or get information about them
  * `manage` - Manage sent messages
    * `set` - Sets the message count <br>
      `@param target-user` - The user to edit <br>
      `@param message-count` - The message count to set <br>
      `@param channel` - Optional. Set message count in the specified channel (leave empty to edit global count) <br>

    * `reset` - Resets the message count <br>
      `@param target-user` - The user to reset <br>
      `@param channel` - Optional. Reset message count in the specified channel (leave empty to reset globally) <br>

  * `infos` - Infos about sent messages
    * `by-user` - Shows you how many messages a user sent <br>
      `@param target-user` - Show message count of the specified user <br>

    * `average` - Shows you the average message count of active users <br>
      `@param channel` - Optional. Average message count in the specified channel (leave empty for a global average) <br>


## How to use
This is repo is the bot's source code, not a bot itself. <br>
To use it, you must host it yourself. There are several methods to do this, some are free, some are paid (Be careful that your hosting solution allows file editing, sometimes called local database, otherwise all the bot's data will be lost if the server restarts). <br>
Once you found the hoster for your bot, here are the steps to follow: <br>
We will first create the bot :
1. Go on [Discord Developer Portal](https://discord.com/developers/applications) and login
2. Click **New Application**, give your bot a name, accept the ToS and developer policy
3. In the **Installation** tab, untick **User Install**, and in **Install Link** select **None**
4. Copy the **Application ID** from the **General Information** tab, save it for later.
5. Select tab **Bot**, click **Reset Token**, copy the token, save it for later.
6. Cutomize the bot as you want (Profile picture, banner, name...). Below **Authorization Flow**, untick **Public Bot**, tick **Server Members Intent** and **Message Content Intent**
7. Save changes.
8. In the **OAuth2** tab, in **Scopes**, select **bot** and **application.commands**, then tick the following permissions:
   * Read Messages/View Channels
   * Send Messages
   * Use Slash Commands
   * Manage Roles
9. Select **Guild Install** and copy the generated URL
10. Follow this URL and add the bot to the server you want, accept everything, the bot should be added to your server !

Now, we can link the bot to the code, so you can start using it : 
1. You need to have [Node.js](https://nodejs.org/en) installed on your machine.
2. [Download my code](https://github.com/DragonJules/MessageCounter/archive/refs/heads/main.zip) and extracted it from the ZIP file, open the folder where it's located, and open a terminal from here.
3. Install the required packages and compile the code by executing the following command:
```bash
npm install --omit=dev && npm run build
```
4. In the bot folder, open the **config** folder, then open **config.json** in any text editor, fill it with the informations you saved previously, like following:
```json
{
    "clientId": "[The Application ID you have saved]",
    "token": "[The Token you have saved]",
    "ephemeralAnswers": true
}
```
5. Replace "true" by "false", if you want the answers of the bot to be visible to everyone.

Your Bot is ready to be uploaded on the server ! The following steps may vary depending on your hosting solution.
1. Upload the whole **MessageCounter-main** folder on the server.
2. Create a routine for restarting the server. Such that the following command is executed from the bot's folder each time the server is restarted.
```bash
npm run start
```
3. Open a terminal from the bot' folder and execute the following command :
```bash
npm run deploy /a
```
4. Restart the server, or run the following command : 
```bash
npm run start
```

All done ! You did it, your bot should be working perfectly ! 
If you have any problem with it, feel free to message me on Discord !


## Known Issues

1. Yet, I haven't implemented anything to prevent the user from setting a global message count smaller than the sum of the channel specific message counts.
