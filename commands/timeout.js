/* eslint-disable no-negated-condition */
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js'),
  // eslint-disable-next-line no-magic-numbers
  fourweeks = 4 * 7 * 24 * 60 * 60 * 1000;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeouts a user')
    .addUserOption((option) => option.setName('user').setDescription('Tag a user')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('duration')
      .setDescription('Enter Duration in minutes. Put 0 to remove timeout. Max 4 weeks.')
      .setMaxValue(fourweeks)
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter reason for Timeout. Default: Timed-out by <you> for <duration> on <today\'s date>'))
    .addBooleanOption((option) => option.setName('dm_reason').setDescription('Send Reason as DM?')),

  async execute(interaction) {
    const dm_reason =
        (await interaction.options.getBoolean('dm_reason')) || false,
      duration = await interaction.options.getInteger('duration'),
      reason =
        (await interaction.options.getString('reason')) ||
        `Timed-out by ${
          interaction.user.tag
        } for ${duration} mins on ${new Date().toString()}`,
      target = await interaction.options.getMember('user');
    try {
      if (!interaction.guild) {
        await interaction.reply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS])
      ) {
        NoPerms.field = [
          {
            name: '**Permissions Required**',
            value: 'MODERATE_MEMBERS'
          }
        ];
        await interaction.reply({
          // content: 'You cannot Timeout members.',
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
      else if (target.moderatable) {
        // eslint-disable-next-line no-magic-numbers
        await target.timeout(duration * 60 * 1000, reason);
        // eslint-disable-next-line no-magic-numbers
        if (duration > 0) {
          const dm_emb = {
            color: 0xe1870a,
            title: '**Timed-out!**',
            // eslint-disable-next-line sort-keys
            description: `${target} is timed-out from ${interaction.guild}`,
            thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
            // eslint-disable-next-line sort-keys
            fields: [
              {
                name: '**Reason**',
                value: `${reason}`
              },
              {
                name: '**Duration**',
                value: `${duration} minute(s)`
              }
            ]
          };
          if (dm_reason) {
            // if there is a reason specified, DM it to the user.
            target.user
              .send({ embeds: [dm_emb] })
              .catch('User cannot be DM-ed');
          }
          await interaction.reply({
            // content: `User ${target.user.tag} is timed-out.\nReason: ${reason}\nDuration: ${duration} minutes`,
            embeds: [dm_emb]
          });
        }
        else {
          const dm_emb = {
            color: 0xe1870a,
            title: '**Timeout removed!**',
            // eslint-disable-next-line sort-keys
            description: `Timeout removed from ${target} in ${interaction.guild}`
          };
          if (dm_reason) {
            // if there is a reason specified, DM it to the user.
            target.user
              .send({ embeds: [dm_emb] })
              .catch('User cannot be DM-ed');
          }
          await interaction.reply({
            // content: `User ${target.user.tag} is timed-out.\nReason: ${reason}\nDuration: ${duration} minutes`,
            embeds: [dm_emb]
          });
        }
      }
      else {
        await interaction.reply({
          components: [SupportRow],
          embeds: [
            {
              title: '**Cannot Time-out...**',
              // eslint-disable-next-line sort-keys
              description: `User ${target} cannot be Timed out :grimacing:\n\nPlease move the bot role higher than that user for this command to work.`,
              // eslint-disable-next-line sort-keys
              color: 0xff0033
            }
          ]
        });
      }
    }
    catch (error) {
      // if any error is thrown
      await interaction.reply({
        components: [SupportRow],
        content: `Error Occured! \nPlease Report to the Developer. \nError Dump:\n${error}`
      });
    }
  }
};
