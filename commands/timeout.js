const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');

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
    const target = await interaction.options.getMember('user');
    const duration = await interaction.options.getInteger('duration');
    const reason =
      (await interaction.options.getString('reason')) ||
      `Timed-out by ${
        interaction.user.tag
      } for ${duration} mins on ${new Date().toString()}`;
    const dm_reason = interaction.options.getBoolean('dm_reason') || false;
    try {
      if (!interaction.guild) {
        await interaction.reply({
          embeds: [NotInsideServer],
          components: [InviteRow],
        });
      }
      else if (
        !interaction.member.permissions.has([
          Permissions.FLAGS.MODERATE_MEMBERS,
        ])
      ) {
        NoPerms.field = [
          {
            name: '**Permissions Required**',
            value: 'MODERATE_MEMBERS',
          },
        ];
        await interaction.reply({
          // content: 'You cannot Timeout members.',
          embeds: [NoPerms],
          components: [InviteRow],
        });
      }
      else {
        await target.timeout(duration * 60 * 1000, reason);
        if (duration > 0) {
          const dm_emb = {
            color: 0xe1870a,
            title: '**Timed-out!**',
            description: `${target} is timed-out from ${interaction.guild}`,
            thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
            fields: [
              {
                name: '**Reason**',
                value: `${reason}`,
              },
              {
                name: '**Duration**',
                value: `${duration} minute(s)`,
              },
            ],
          };
          if (dm_reason) {
            // If there is a reason specified, DM it to the user.
            target.user
              .send({ embeds: [dm_emb] })
              .catch('User cannot be DM-ed');
          }
          await interaction.reply({
            // content: `User ${target.user.tag} is timed-out.\nReason: ${reason}\nDuration: ${duration} minutes`,
            embeds: [dm_emb],
          });
        }
        else {
          const dm_emb = {
            color: 0xe1870a,
            title: '**Timeout removed!**',
            description: `Timeout removed from ${target} in ${interaction.guild}`,
          };
          if (dm_reason) {
            // If there is a reason specified, DM it to the user.
            target.user
              .send({ embeds: [dm_emb] })
              .catch('User cannot be DM-ed');
          }
          await interaction.reply({
            // content: `User ${target.user.tag} is timed-out.\nReason: ${reason}\nDuration: ${duration} minutes`,
            embeds: [dm_emb],
          });
        }
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
