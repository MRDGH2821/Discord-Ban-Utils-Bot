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
    await interaction.deferReply();
    const target = interaction.options.getUser('user');
    const reas =
      interaction.options.getString('reason') ||
      `Banned by ${
        interaction.user.tag
      } on ${new Date().toDateString()} ||for no reason :joy:||`;
    try {
      if (!interaction.guild) {
        // if not in server
        await interaction.editReply({
          embeds: [
            {
              color: 0xd8d4d3,
              title: 'Are you in a server?:unamused:',
              description:
                'This command can only be used inside Server :shrug:',
            },
          ],
          components: [InviteRow],
        });
      }
      else if (
        interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        // Drop the Ban Hammer!
        await interaction.guild.members.ban(target, {
          reason: reas,
        });
        await interaction.editReply({
          // content: `User \`${target.tag}\` is banned from this server. \nReason: ${reas}.`,
          embeds: [
            {
              color: 0xe1870a,
              title: 'Ban Hammer Dropped!',
              description: `User \`${target.tag}\` ${target} is banned from this server.`,
              fields: [
                {
                  name: '**Reason**',
                  value: reas,
                },
              ],
            },
          ],
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
        // when no ban permissions
        await interaction.editReply({
          content: 'You cannot ban...',
          components: [InviteRow],
        });
      }
    }
    catch (e) {
      await interaction.editReply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
        components: [SupportRow],
      });
    }
  },
};
