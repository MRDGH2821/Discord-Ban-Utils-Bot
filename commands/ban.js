const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js'),
  default_days = 7;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('Enter the User ID (i.e. snowflake) or tag them')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter Reason. (Default: No reason Given)'))
    .addNumberOption((option) => option
      .setName('delete_messages')
      .setDescription('Enter number of days of msgs to delete')),

  async execute(interaction) {
    await interaction.deferReply();
    const delete_msg_days =
        (await interaction.options.getNumber('delete_messages')) ||
        default_days,
      reas =
        (await interaction.options.getString('reason')) ||
        `Banned by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`,
      target = await interaction.options.getUser('user');

    try {
      if (!interaction.guild) {
        // if not in server
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (!target.bannable) {
        await interaction.editReply({
          components: [SupportRow],
          embeds: [
            {
              title: '**Cannot Ban...**',
              // eslint-disable-next-line sort-keys
              description: `User ${target} cannot be banned :grimacing:\n\nPlease move the bot role higher than that user for this command to work.`,
              // eslint-disable-next-line sort-keys
              color: 0xff0033
            }
          ]
        });
      }
      else if (
        interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        // drop the Ban Hammer!
        await interaction.guild.members.ban(target, {
          days: delete_msg_days,
          reason: reas
        });

        await interaction.editReply({
          // content: `User \`${target.tag}\` is banned from this server. \nReason: ${reas}.`,
          embeds: [
            {
              color: 0xe1870a,
              title: '**Ban Hammer Dropped!**',
              // eslint-disable-next-line sort-keys
              description: `User \`${target.tag}\` ${target} is banned from this server.\nNumber of days of msgs deleted: ${delete_msg_days}`,
              thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
              // eslint-disable-next-line sort-keys
              fields: [
                {
                  name: '**Reason**',
                  value: reas
                }
              ],
              timestamp: new Date(),
              // eslint-disable-next-line sort-keys
              footer: {
                text: target.id
              }
            }
          ]
        });
        await interaction.client.emit(
          'userBanned',
          interaction,
          // target,
          reas,
          delete_msg_days
        );
      }
      else {
        // when no ban permissions
        NoPerms.fields = {
          name: '**Permissions required**',
          value: 'BAN_MEMBERS'
        };
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
    }
    catch (err) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${err}\``
      });
    }
  }
};
