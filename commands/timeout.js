// eslint-disable-next-line no-unused-vars
const { Permissions, MessageEmbed, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { SupportRow, InviteRow } = require('../lib/RowButtons.js');
const { NUMBER, TIME, EMBCOLORS } = require('../lib/Constants.js');
const { timeoutDurationText } = require('../lib/UtilityFunctions.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Put a user in timeout')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('Select a user to timeout')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('duration')
      .setDescription('Enter Timeout duration.')
      .setRequired(true)
      .addChoice('0 i.e. Remove timeout', NUMBER.zero)
      .addChoice('60 seconds', TIME.minute)
      .addChoice('5 minutes', TIME.minute * NUMBER.five)
      .addChoice('10 minutes', TIME.minute * NUMBER.ten)
      .addChoice('30 minutes', TIME.hour / NUMBER.two)
      .addChoice('1 hour', TIME.hour)
      .addChoice('2 hours', TIME.hour * NUMBER.two)
      .addChoice('6 hours', TIME.hour * NUMBER.six)
      .addChoice('12 hours', TIME.day / NUMBER.two)
      .addChoice('1 day', TIME.day)
      .addChoice('3 days', TIME.day * NUMBER.three)
      .addChoice('1 week', TIME.week)
      .addChoice('3 weeks', TIME.week * NUMBER.three))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter reason for Timeout. Default: Timed-out by <you> for <duration> on <today\'s date>')),

  note: 'Default reason is: Timed-out by <you> on <today\'s date>.',

  /**
   * timeout a user
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const duration = interaction.options.getInteger('duration'),
      isInGuild = interaction.inGuild(),
      reason =
        interaction.options.getString('reason') ||
        `Timed-out by ${interaction.user.tag} for ${timeoutDurationText(duration)} on ${new Date().toString()}`,
      target = interaction.options.getMember('user');
    console.log(duration);
    let canTimeout = false,
      isModeratable = false;

    try {
      canTimeout = await interaction.member.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS]);
      isModeratable = target.moderatable;
      if (isInGuild && canTimeout) {
        await target.timeout(duration, reason);
        if (duration > NUMBER.zero) {
          const timeout_success = new MessageEmbed()
            .setColor(EMBCOLORS.freeze)
            .setTitle('**User put in Timeout!**')
            .setDescription(`User \`${target.user.tag}\` ${target} is put into timeout.`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields([
              {
                name: '**Reason**',
                value: `${reason}`
              },
              {
                name: '**Duration**',
                value: timeoutDurationText(duration)
              }
            ])
            .setTimestamp();

          await interaction.editReply({ embeds: [timeout_success] });
        }
        else {
          const timeout_removed = new MessageEmbed()
            .setColor(EMBCOLORS.whiteGray)
            .setTitle('**Timeout Removed**')
            .setDescription(`User \`${target.user.tag}\` ${target} is out of timeout.`)
            .setTimestamp();
          await interaction.editReply({ embeds: [timeout_removed] });
        }
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Timeout? ${canTimeout}`);
      }
    }
    catch (error) {
      const timeout_fail = new MessageEmbed()
        .setColor(EMBCOLORS.error)
        .setTitle('**Cannot Timeout...**')
        .setDescription(`User ${target} cannot be put in Timeout :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.\n(In DM channel, user will be always null for obvious reasons.)`)
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you Timeout? **\`${canTimeout}\`**\nTarget moderatable? **\`${isModeratable}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions. Also make sure the bot role is above that user\'s highest role for this command to work.'
          },
          {
            name: '**Inputs given**',
            value: `User: ${target} \nTimeout duration: ${timeoutDurationText(duration)}\nReason: ${reason}`
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
        embeds: [timeout_fail]
      });
      console.error(error);
    }
  }
};
