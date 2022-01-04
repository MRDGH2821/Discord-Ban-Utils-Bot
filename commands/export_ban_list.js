const dpst = require('dpaste-ts');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { token } = require('../lib/ConfigManager.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export_ban_list')
    .setDescription('Exports ban list of current server'),

  async execute(interaction) {
    try {
      // Fetch bans
      if (interaction.guild) {
        // When used inside server
        const bans = await rest.get(Routes.guildBans(interaction.guildId));
        await interaction.deferReply();
        await interaction.editReply(`Found ${bans.length} bans. Exporting...`);
        console.log(`Found ${bans.length} bans. Exporting...`);

        // Export bans
        const results = [];

        bans.forEach((v) => {
          results.push(v.user.id);
        });
        // results = JSON.stringify(results);

        const outputFile = `${interaction.guild.name}-${date}.txt`;
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
