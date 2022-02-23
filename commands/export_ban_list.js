const {
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  MessageEmbed,
  MessageAttachment
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EMBCOLORS } = require('../lib/Constants.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { exportBanAdv, exportBanSimple } = require('../lib/UtilityFunctions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_ban_list')
    .setDescription('Exports ban list of current server')
    .addBooleanOption((option) => option
      .setName('advanced')
      .setDescription('Select true to export with reason. Default false')),

  note: 'Simple mode exports list which is compatible with other popular ban bots.\nAdvanced mode exports list with reason but only compatible with Ban Utils only.\nList is exported to [dpaste.com](https://dpaste.com/)',

  /**
   * export ban list of current server
   * @async
   * @function execute
   * @param {CommandInteraction} interaction - interaction object
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const advMode = interaction.options.getBoolean('advanced') || false,
      isInGuild = interaction.inGuild();
    try {
      if (isInGuild) {
        const bans = await interaction.guild.bans.fetch(),
          resultEmb = new MessageEmbed()
            .setTitle('**Exporting Ban List**')
            .setColor(EMBCOLORS.whiteGray)
            .setTimestamp();

        resultEmb
          .setDescription(`Found ${bans.size} bans.\nAdvanced Mode: \`${advMode}\`\nExporting...`)
          .setTimestamp();
        await interaction.editReply({
          embeds: [resultEmb]
        });
        if (advMode) {
          const urls = await exportBanAdv(bans, interaction.guild.name);
          let urlFormat = '';
          urls.forEach((url) => {
            urlFormat = `${urlFormat}\n${url}`;
          });
          // eslint-disable-next-line one-var
          const urlsAttachment = new MessageAttachment(Buffer.from(urlFormat))
            .setName(`Ban list links of ${interaction.guild.name}.txt`)
            .setDescription('This is the list of links');

          resultEmb
            .setTitle('**Ban List Export Success!**')
            .addField('**Number of parts**', `${urls.length}`)
            .setTimestamp();

          await interaction.editReply({
            components: [InviteRow],
            embeds: [resultEmb],
            files: [urlsAttachment]
          });
          interaction.client.emit('exportListSuccess', interaction, {
            advanceMode: advMode,
            files: urlsAttachment
          });
        }
        else {
          const urls = await exportBanSimple(bans, interaction.guild.name);
          let urlFormat = '';
          urls.forEach((url) => {
            urlFormat = `${urlFormat}\n${url}`;
          });
          // eslint-disable-next-line one-var
          const urlsAttachment = new MessageAttachment(Buffer.from(urlFormat))
            .setName(`Ban list links of ${interaction.guild.name}.txt`)
            .setDescription('This is the list of links');

          resultEmb
            .setTitle('**Ban List Export Success!**')
            .addField('**Number of parts**', `${urls.length}`)
            .setTimestamp();

          await interaction.editReply({
            components: [InviteRow],
            embeds: [resultEmb],
            files: [urlsAttachment]
          });
          interaction.client.emit('exportListSuccess', interaction, {
            advanceMode: advMode,
            files: urlsAttachment
          });
        }
      }
      else {
        throw new Error('Cannot export outside sever. Please use this command inside server.');
      }
    }
    catch (error) {
      const ban_fail = new MessageEmbed()
        .setColor(EMBCOLORS.error)
        .setTitle('**Cannot Export...**')
        .setDescription('Ban list cannot be exported.')
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server. Or wait for sometime for [dpaste API](https://dpaste.com/api/v2/) to cool down.'
          },
          {
            name: '**Inputs given**',
            value: `Advanced mode: ${advMode}`
          },
          {
            name: '**Bot Error Dump**',
            value: `${error}`
          }
        ])
        .setTimestamp();

      await interaction.editReply({
        components: [
          SupportRow,
          InviteRow
        ],
        embeds: [ban_fail]
      });
      console.error(error);
    }
  }
};
