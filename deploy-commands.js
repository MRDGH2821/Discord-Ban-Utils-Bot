const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./lib/ConfigManager.js');

const commands = [].map((command) => command.toJSON());

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log('Global Commands registered.');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [],
    });

    console.log('Successfully registered application (/) commands.');
  }
  catch (error) {
    console.error(error);
  }
})();

/* All commands deleter
		rest.get(Routes.applicationGuildCommands(clientId, guildId))
			.then(data => {
				const promises = [];
				for (const command of data) {
					const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
					promises.push(rest.delete(deleteUrl));
				}
				return Promise.all(promises);
			});
		rest.get(Routes.applicationCommands(clientId, guildId))
			.then(data => {
				const promises = [];
				for (const command of data) {
					const deleteUrl = `${Routes.applicationCommands(clientId, guildId)}/${command.id}`;
					promises.push(rest.delete(deleteUrl));
				}
				return Promise.all(promises);
			});
*/
