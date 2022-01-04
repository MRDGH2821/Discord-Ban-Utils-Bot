const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Enter the User ID (i.e. snowflake) or tag them')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Enter Reason. (Default: No reason Given)'),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reas =
      interaction.options.getString('reason') ||
      `Banned by ${
        interaction.user.tag
      } on ${new Date().toDateString()} ||for no reason :joy:||`;
    try {
      if (!interaction.guild) {
        await interaction.reply({
          content:
            'Are you sure you are in a server to execute this?:unamused: \nBecause this command can only be used in Server Text channels or Threads :shrug:',
          components: [InviteRow],
        });
      }
      if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
        // Drop the Ban Hammer!
        await interaction.guild.members.ban(target, {
          reason: reas,
        });
        await interaction.reply({
          content: `User \`${target.tag}\` is banned from this server. \nReason: ${reas}.`,
        });
        await interaction.client.emit(
          'userBanned',
          interaction.client,
          interaction.user,
          target,
          reas,
          interaction.guild,
        );
      }
      else {
        await interaction.reply({
          content: 'You cannot ban...',
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
