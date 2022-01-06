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
        // When used inside server
        //  const sampleBans = await interaction.guild.bans.fetch();
        //  console.log('DJS: ', sampleBans.first());
        const bans = await interaction.guild.bans.fetch();

        // Export bans
        let results = new String();
        console.log(bans.size);
        bans.forEach((v) => {
          results = results + ' ' + v.user.id;
        });
        // results = JSON.stringify(results);
        await interaction.editReply(`Found ${bans.size} bans. Exporting...`);
        console.log(`Found ${bans.size} bans. Exporting...`);

        const outputFile = `${interaction.guild.name}-${new Date()}.txt`;
        dpst
          .CreatePaste(results, outputFile, 'text')
          .then(async (url) => {
            await interaction.followUp({
              content: url,
              components: [InviteRow],
            });
          })
          .catch(async (error) => {
            // Incase of any errors
            await interaction.followUp({
              content: `There was some unexpected error.\nError Dump: ${error}`,
              components: [SupportRow],
            });
          });
      }
      else {
        await interaction.editReply({
          content: 'Please use this command inside server!',
          components: [InviteRow],
        });
      }
    }
    catch (e) {
      interaction.editReply({
        content: `Unexpected error occured, please report it to the developer! \nError dump:\n\n\`${e}\``,
        components: [SupportRow],
      });
    }
  },
};
