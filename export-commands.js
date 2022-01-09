const fs = require('fs');

const commands = [].map((command) => command.toJSON());

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

module.exports = {
  commands,
};
