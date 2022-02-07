const { Permissions, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { SupportRow, InviteRow } = require('../lib/RowButtons'),
  default_days = 7;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('Enter user ID (i.e. snowflake) or tag them')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter Reason. (Default: Banned by <you> on <today\'s date>)'))
    .addNumberOption((option) => option
      .setName('delete_messages')
      .setDescription('Enter number of msgs (in days) to delete')),

  note: `Default reason is: Banned by <you> on <today's date>. Default days of messages deleted is ${default_days}`,

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const delete_msg_days =
        (await interaction.options.getNumber('delete_messages')) ||
        default_days,
      reason =
        (await interaction.options.getString('reason')) ||
        `Banned by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`,
      target = await interaction.options.getUser('user');
    // eslint-disable-next-line one-var
    let canBan = false,
      isBannable = false,
      isInGuild = false;

    try {
      canBan = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);
      isBannable = target.bannable;
      isInGuild = await interaction.guild;

      if (isInGuild && canBan) {
        await interaction.guild.members.ban(target, {
          days: delete_msg_days,
          reason
        });

        const ban_success = new MessageEmbed()
          .setColor('e1870a')
          .setTitle('**Ban Hammer Dropped!**')
          .setDescription(`User \`${target.tag}\` ${target} is banned from this server.\nNumber of messages (in days) deleted: ${delete_msg_days}`)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .addFields([
            {
              name: '**Reason**',
              value: `${reason}`
            },
            {
              name: '**Target ID**',
              value: `${target.id}`
            }
          ])
          .setTimestamp();
        await interaction.editReply({ embeds: [ban_success] });
        await interaction.client.emit(
          'userBanned',
          interaction,
          reason,
          delete_msg_days
        );
      }
    }
    catch (error) {
      const ban_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Ban...**')
        .setDescription(`User ${target} cannot be banned :grimacing:\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.`)
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you ban? **\`${canBan}\`**\nTarget bannable? **\`${isBannable}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have ban permissions. Also make sure the bot role is above that user\'s highest role for this command to work.'
          },
          {
            name: '**Inputs given**',
            value: `User: ${target}  ${target.id}\nReason: ${reason}\nNumber of msgs (in days) to be deleted: ${delete_msg_days}`
          },
          {
            name: '**Bot Error Dump**',
            value: `${error}`
          }
        ]);

      await interaction.editReply({
        components: [
          SupportRow,
          InviteRow
        ],
        embeds: [ban_fail]
      });

      console.error(error);
    }
  }
};
