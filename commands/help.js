// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { version } = require('../package.json');
const { EMBCOLORS } = require('../lib/Constants.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js'),
  additionalFields = [
    {
      name: '**Important NOTE!**',
      value:
        'The Bot role needs to be higher than target user\'s highest role. Only then the mod commands will work. \n*You have to become your boss\'s boss to fire the boss. Else how can you do it :shrug:*'
    },
    {
      name: '**Bot still not working?**',
      value:
        'Please join the support [server](https://discord.gg/MPtE9zsBs5) & elaborate how you encountered that problem. You may also submit an issue at [Github Repository](https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues)'
    }
  ],
  newFields = [
    {
      name: '**/ban**',
      value:
        'Bans a user\n**Note:** Default reason is: Banned by <you> on <today\'s date>. Default & max days of messages deleted is 7'
    },
    {
      name: '**/export_ban_list**',
      value:
        'Exports ban list of current server\n**Note:** Simple mode exports list which is compatible with other popular ban bots.\nAdvanced mode exports list with reason but only compatible with Ban Utils only.\nList is exported to [dpaste.com](https://dpaste.com/)'
    },
    {
      name: '**/help**',
      value:
        'The help section to get you started!\n**Note:** All commands have an additional note like this which explain more about the respective command.'
    },
    {
      name: '**/import_ban_list**',
      value:
        'Imports ban list into current server\n**Note:** For simple import type, provided/default reason is used. For advanced import type, included reason is used. Type of import is automatically determined.\nLink should be of [dpaste](https://dpaste.com/). Other links are not supported'
    },
    {
      name: '**/kick**',
      value:
        'Kicks a user\n**Note:** Default reason is: Kicked by <you> on <today\'s date>.'
    },
    {
      name: '**/mass_ban**',
      value:
        'Mass Bans given IDs\n**Note:** Default reason is: Mass banned by <you> on <today\'s date>.\nIt will automatically filter out duplicate bans.\nSometimes you might put multiple IDs but it doesn\'t work. \nYou may either put the IDs on [dpaste.com](https://dpaste.com) & use import command or follow this [video](https://youtu.be/gxAqukdjtM8)'
    },
    {
      name: '**/ping**',
      value:
        'Replies with bot latency!\n**Note:** Shows ping results of both, complete round trip & Discord API responsiveness'
    },
    {
      name: '**/set_logs**',
      value:
        'Set a log channel\n**Note:** Type of logs sent: 1.Ban list import-export log \n2.Ban-unban log  \n3.Member leaving server log. \nMore type of logs coming soon.'
    },
    {
      name: '**/timeout**',
      value:
        'Put a user in timeout\n**Note:** Default reason is: Timed-out by <you> on <today\'s date>.'
    },
    {
      name: '**/transfer_bans**',
      value:
        'Transfers Bans across servers\n**Note:** It will automatically filter out duplicate bans while transferring. Transfers bans with their reasons.'
    },
    { name: '**/unban**', value: 'Un-bans a user\n**Note:** none' },
    {
      name: '**/user_info**',
      value:
        'Display info about given user.\n**Note:** If a server member is not found, will show your details. Using in DM will show different yet interesting information'
    }
  ];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('The help section to get you started!'),

  note: 'All commands have an additional note like this which explain more about the respective command.',

  /**
   * display help section
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    const helpEmbed = new MessageEmbed()
      .setColor(EMBCOLORS.whiteGray)
      .setTitle('**Help Section**')
      .setDescription(`The help section for you to get started with the bot!\nIt helps you import, export & transfer bans from one server to another.\n\nBot version **\`${version}\`**`)
      .addFields(newFields)
      .addFields(additionalFields)
      .setTimestamp();

    await interaction.reply({
      components: [
        InviteRow,
        SupportRow
      ],
      embeds: [helpEmbed]
    });
  }
};
