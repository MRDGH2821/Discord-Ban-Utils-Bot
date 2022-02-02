const dpst = require('dpaste-ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_ban_list')
    .setDescription('Exports ban list of current server'),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      // Fetch bans
      if (interaction.guild) {
        const bans = await interaction.guild.bans.fetch(),
          outputFile = `${interaction.guild.name}-${new Date()}.txt`;

        /*
         * When used inside server
         *  Const sampleBans = await interaction.guild.bans.fetch();
         *  Console.log('DJS: ', sampleBans.first());
         */

        // Export bans
        let results = '';
        console.log(bans.size);
        bans.forEach((ban) => {
          results = `${results} ${ban.user.id}`;
        });
        // Results = JSON.stringify(results);
        await interaction.editReply(`Found ${bans.size} bans. Exporting...`);
        console.log(`Found ${bans.size} bans. Exporting...`);

        dpst
          // eslint-disable-next-line new-cap
          .CreatePaste(results, outputFile, 'text')
          .then(async(url) => {
            await interaction.followUp({
              components: [InviteRow],
              content: url
            });
            interaction.client.emit('exportListSuccess', interaction, url);
          })
          .catch(async(error) => {
            // Incase of any errors
            await interaction.followUp({
              components: [SupportRow],
              content: `There was some unexpected error.\nError Dump: ${error}`
            });
          });
      }
      else {
        await interaction.editReply({
          components: [InviteRow],
          content: 'Please use this command inside server!'
        });
      }
    }
    catch (err) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected error occured, please report it to the developer! \nError dump:\n\n\`${err}\``
      });
    }
  }
};
