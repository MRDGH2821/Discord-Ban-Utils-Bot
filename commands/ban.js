// eslint-disable-next-line no-unused-vars
const { Permissions, MessageEmbed, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { SupportRow, InviteRow } = require('../lib/RowButtons.js');
const { default_delete_days, EMBCOLORS } = require('../lib/Constants.js');

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
      .setDescription('Enter number of msgs (in days) to delete. (Max and Default is 7 days')
      .setMaxValue(default_delete_days)),

  note: `Default reason is: Banned by <you> on <today's date>. Default & max days of messages deleted is ${default_delete_days}`,

  /**
   * ban a user
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const delete_msg_days =
        interaction.options.getNumber('delete_messages') || default_delete_days,
      isInGuild = interaction.inGuild(),
      reason =
        interaction.options.getString('reason') ||
        `Banned by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`,
      target = interaction.options.getUser('user');

    let canBan = false,
      isBannable = false;

    try {
      canBan = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);
      isBannable = target.bannable;

      if (isInGuild && canBan) {
        await interaction.guild.members.ban(target, {
          days: delete_msg_days,
          reason
        });

        const ban_success = new MessageEmbed()
          .setColor(EMBCOLORS.hammerHandle)
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
        interaction.client.emit('userBanned', interaction, {
          daysOfMsgs: delete_msg_days,
          reason
        });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Ban? ${canBan}`);
      }
    }
    catch (error) {
      const ban_fail = new MessageEmbed()
        .setColor(EMBCOLORS.error)
        .setTitle('**Cannot Ban...**')
        .setDescription(`User ${target} cannot be banned :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.`)
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you ban? **\`${canBan}\`**\nTarget bannable? **\`${isBannable}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions. Also make sure the bot role is above that user\'s highest role for this command to work.'
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
