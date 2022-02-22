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
    },
    {
      name: '**Bot Version**',
      value: `${version}`
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
    const cmdInfo = interaction.client.commands.map((cmd) => {
        const format = {
          name: `**/${cmd.data.name}**`,
          value: `${cmd.data.description}\n**Note:** ${cmd.note || 'none'}`
        };
        return format;
      }),
      helpEmbed = new MessageEmbed()
        .setColor(EMBCOLORS.whiteGray)
        .setTitle('**Help Section**')
        .setDescription('The help section for you to get started with the bot!\nIt helps you import, export & transfer bans from one server to another.')
        .addFields(cmdInfo)
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
