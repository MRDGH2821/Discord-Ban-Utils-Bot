const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeouts a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Tag a user')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Enter reason for Timeout'),
    )
    .addIntegerOption((option) =>
      option
        .setName('duration')
        .setdesription('Enter Duration in minutes. Max 4 weeks.'),
    )
    .addBooleanOption((option) =>
      option.setName('dm_reason').setdesription('Send Reason as DM?'),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    const duration = interaction.options.getInteger('duration');
    const dm_reason = interaction.options.getboolean('dm_reason');
    try {
      if (interaction.guild) {
        if (
          interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])
        ) {
          // Checks if target user can be managed or not
          if (target.managable) {
            // If there is a reason specified, DM it to the user.
            if (dm_reason) {
              try {
                await target.user.send(
                  `Reason for timeout from ${interaction.guild.name}: ${reason}`,
                );
              }
              catch (e) {
                console.log('Reason cannot be DM-ed');
              }
            }
            await interaction.reply({
              content: `User \`${target.user.tag}\` is timed-out from this server.`,
            });
            await target.timeout(duration * 60 * 1000, reason);
          }
          // If user cannot be kicked
          else {
            await await interaction.reply({
              content: `User \`${target.user.tag}\` cannot be timed-out :grimacing:.`,
            });
          }
        }
        // If you don't have permissions to kick
        else {
          await interaction.reply({
            content: 'You cannot timeout anyone...',
            components: [InviteRow],
          });
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
