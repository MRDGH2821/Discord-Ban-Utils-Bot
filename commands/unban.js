const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Enter the User ID (i.e. snowflake) or tag them')
        .setRequired(true),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    try {
      if (interaction.guild) {
        if (
          interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
        ) {
          interaction.guild.members.unban(target);
          await interaction.reply({
            content: `User \`${target.tag}\` is unbanned from this server.`,
          });
        }
        else {
          await interaction.reply('You cannot unban...');
        }
      }
      else {
        await interaction.reply({
          content:
            'Are you sure you are in a server to execute this?:unamused: \nBecause this command can only be used in Server Text channels or Threads :shrug:',
          components: [InviteRow],
        });
      }
    }
    catch (e) {
      await interaction.reply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
        components: [SupportRow],
      });
    }
  },
};
