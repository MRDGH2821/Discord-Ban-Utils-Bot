const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dpst = require('dpaste-ts');
const { InviteRow, SupportRow } = require('../lib/RowButtons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_ban_list')
    .setDescription('Exports ban list of current server')
    .addBooleanOption((option) => option
      .setName('advanced')
      .setDescription('Select true to export with reason. Default false')),

  note: 'Simple mode exports list which is compatible with other popular ban bots.\nAdvanced mode exports list with reason but only compatible with Ban Utils only.',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const advMode = (await interaction.options.getBoolean('advanced')) || false,
      isInGuild = await interaction.inGuild();
    try {
      if (isInGuild) {
        const bans = await interaction.guild.bans.fetch(),
          outputAdv = `${interaction.guild.name}-${new Date()}.json`,
          outputSimple = `${interaction.guild.name}-${new Date()}.txt`,
          resultAdv = [];
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
        await interaction.editReply(`Found ${bans.size} bans.\nAdvanced Mode: ${advMode}\nExporting...`);
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
        .setColor('ff0033')
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
              'Use this command inside a server. Or wait for sometime for [dpaste API](https://dpaste.com/api/v2/) to cooldown.'
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
