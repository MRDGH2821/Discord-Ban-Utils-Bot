const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./lib/ConfigManager.js'),
  eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js')),
  myintents = new Intents().add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.DIRECT_MESSAGES
  ),
  // eslint-disable-next-line sort-vars
  client = new Client({
    intents: myintents,
    partials: [
      'CHANNEL',
      'REACTION'
    ]
  }),
  // eslint-disable-next-line sort-vars
  commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  //  console.log('Inside loop', event);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
    // console.log('Inside If', event.name);
  }
  else {
    client.on(event.name, (...args) => event.execute(...args));
    // console.log('Inside else', event.name);
  }
}

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  /*
   * set a new item in the Collection
   * With the key as the command name and the value as the exported module
   */
  client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async(interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  }
  catch (error) {
    console.error(error);

    // eslint-disable-next-line consistent-return
    return (
      interaction.reply({
        content: `There was an error while executing this command!\nUse help command and report to developer!\n\nError Dump:\n${error}`,
        ephemeral: true
      }) ||
      interaction.editReply({
        content: `There was an error while executing this command!\nUse help command and report to developer!\n\nError Dump:\n${error}`,
        ephemeral: true
      })
    );
  }
  // console.log('${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.');
});

client.login(token);
