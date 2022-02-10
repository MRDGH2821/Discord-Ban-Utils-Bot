const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { version } = require('../package.json');
const { link } = require('../lib/InviteLink.json'),
  row = new MessageActionRow()
    .addComponents(new MessageButton()
      .setLabel('Join Support Server')
      .setStyle('LINK')
      .setURL('https://discord.gg/MPtE9zsBs5'))
    .addComponents(new MessageButton()
      .setLabel('Report an Issue at GitHub')
      .setStyle('LINK')
      .setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues'))
    .addComponents(new MessageButton()
      .setLabel('GitHub Repository')
      .setStyle('LINK')
      .setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot'))
    .addComponents(new MessageButton()
      .setLabel('Invite the Bot in your server!')
      .setStyle('LINK')
      .setURL(link)),
  // eslint-disable-next-line sort-vars
  oldFields = [
    { name: '**/ban**', value: 'Bans the given user.' },
    { name: '**/unban**', value: 'Unbans the given user.' },
    {
      name: '**/import_ban_list**',
      value: 'Imports the ban list from dpaste link'
    },
    {
      name: '**/export_ban_list**',
      value: 'Exports the Ban list to [dpaste](https://dpaste.com)'
    },
    {
      name: '**/transfer_bans**',
      value:
        'Exports the ban list from current server & imports it into target server without extra steps.'
    },
    {
      name: '**/mass_ban**',
      value:
        'Mass bans given IDs.\nSometimes you might put multiple IDs but it doesn\'t work. \nYou may either put the IDs on [dpaste.com](https://dpaste.com) & use import command or follow this [video](https://youtu.be/gxAqukdjtM8)'
    },
    { name: '**/kick**', value: 'Kicks the given user.' },
    { name: '**/ping**', value: 'Bot Latency.' },
    {
      name: '**/user_info**',
      value: 'Tells if you have the permissions to kick or ban .'
    },
    {
      name: '**/set_logs**',
      value:
        'Setup a log channel.\n**NOTE:** This functionality is still Beta quality!'
    },
    {
      name: '**NOTE!**',
      value:
        'The Bot role needs to be higher than target user\'s highest role. Only then the mod commands will work. \n*You have to become your boss\'s boss to fire the boss. Else how can you do it :shrug:*'
    },
    {
      name: '**Bot still not working?**',
      value:
        'Please join my server & elaborate how you encountered that problem. You may also submit an issue at [Github Repository](https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues)'
    }
  ];
module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('The help section to get you started!'),

  async execute(interaction) {
    const helpEmbed = {
      color: 0xd8d4d3,
      title: '**Help Section**',
      url: 'https://discord.gg/MPtE9zsBs5',
      // eslint-disable-next-line sort-keys
      description:
        'The help section you get you started!\nThe bot helps you import, export & transfer bans from one server to another.',
      fields: [],
      footer: { text: `Bot version ${version}` }
    };

    helpEmbed.fields.push(oldFields);

    await interaction.reply({
      components: [row],
      embeds: [helpEmbed]
    });
  }
};
