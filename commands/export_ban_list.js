const dpst = require('dpaste-ts');
// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EMBCOLORS } = require('../lib/Constants.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_ban_list')
    .setDescription('Exports ban list of current server')
    .addBooleanOption((option) => option
      .setName('advanced')
      .setDescription('Select true to export with reason. Default false')),

  note: 'Simple mode exports list which is compatible with other popular ban bots.\nAdvanced mode exports list with reason but only compatible with Ban Utils only.',

  /**
   * export ban list of current server
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const advMode = interaction.options.getBoolean('advanced') || false,
      isInGuild = interaction.inGuild();
    try {
      if (isInGuild) {
        const bans = await interaction.guild.bans.fetch(),
          outputAdv = `${interaction.guild.name}-${new Date()}.json`,
          outputSimple = `${interaction.guild.name}-${new Date()}.txt`,
          resultAdv = [],
          resultEmb = new MessageEmbed()
            .setTitle('**Exporting Ban List**')
            .setColor(EMBCOLORS.whiteGray);
        let finalOutput = '',
          finalResult = '',
          finalType = '',
          resultSimple = '';
        bans.forEach((ban) => {
          resultSimple = `${resultSimple} ${ban.user.id}`;
          resultAdv.push({
            id: `${ban.user.id}`,
            reason: `${ban.reason}`
          });
        });
        resultEmb.setDescription(`Found ${bans.size} bans.\nAdvanced Mode: \`${advMode}\`\nExporting...`);
        await interaction.editReply({
          embeds: [resultEmb]
        });
        if (advMode) {
          finalResult = JSON.stringify(resultAdv);
          finalOutput = outputAdv;
          finalType = 'json';
        }
        else {
          finalResult = resultSimple;
          finalOutput = outputSimple;
          finalType = 'text';
        }
        dpst
          // eslint-disable-next-line new-cap
          .CreatePaste(finalResult, finalOutput, finalType)
          .then(async(url) => {
            resultEmb
              .setTitle('**Ban List Export Success!**')
              .addField('**URL**', url);
            await interaction.editReply({
              embeds: [resultEmb]
            });
            await interaction.followUp({
              components: [InviteRow],
              content: url
            });
            interaction.client.emit('exportListSuccess', interaction, {
              advanceMode: advMode,
              url
            });
          })
          .catch((error) => {
            throw error;
          });
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
        ]);

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
