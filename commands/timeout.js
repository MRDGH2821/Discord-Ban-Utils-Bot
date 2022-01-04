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
    .addIntegerOption((option) =>
      option
        .setName('duration')
        .setDescription(
          'Enter Duration in minutes. Put 0 to remove timeout. Max 4 weeks.',
        )
        .setMaxValue(5760000)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription(
          'Enter reason for Timeout. Default: Timed-out by <you> for <duration> on <today\'s date>',
        ),
    )
    .addBooleanOption((option) =>
      option.setName('dm_reason').setDescription('Send Reason as DM?'),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason =
      interaction.options.getString('reason') ||
      `Timed-out by ${
        interaction.user.tag
      } for ${duration} mins on ${new Date().toString()}`;
    const dm_reason = interaction.options.getBoolean('dm_reason') || false;
    try {
      if (!interaction.guild) {
        throw 'Are you sure you are in a server to execute this?:unamused: \nBecause this command can only be used in Server Text channels or Threads :shrug:';
      }
      if (
        !interaction.member.permissions.has([
          Permissions.FLAGS.MODERATE_MEMBERS,
        ])
      ) {
        await interaction.reply({
          content: 'You cannot Timeout members.',
          components: [InviteRow],
        });
      }
      else {
        await target.timeout(duration * 60 * 1000, reason);
        if (dm_reason) {
          // If there is a reason specified, DM it to the user.
          target.user
            .send(
              `You have been timed-out from ${interaction.guild.name}.\nReason: ${reason}\nDuration: ${duration}`,
            )
            .catch('User cannot be DM-ed');
        }

        await interaction.reply({
          content: `User ${target.user.tag} is timed-out.\nReason: ${reason}\nDuration: ${duration} minutes`,
        });
      }
    }
    catch (e) {
      // If any error is thrown

      await interaction.reply({
        content: `Error Occured! \nPlease Report to the Developer. \nError Dump:\n${e}`,
        components: [SupportRow],
      });
    }
  },
};
