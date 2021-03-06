// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Permissions, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EMBCOLORS } = require('../lib/Constants.js');
const { SupportRow, InviteRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user')
    .addUserOption((option) => option.setName('user').setDescription('Tag a user')
      .setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Enter reason for Kick if any.')),

  note: 'Default reason is: Kicked by <you> on <today\'s date>.',

  /**
   * kick a user
   * @async
   * @function execute
   * @param {CommandInteraction} interaction - interaction object
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const isInGuild = interaction.inGuild(),
      reason =
        interaction.options.getString('reason') ||
        `Kicked by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`,
      target =
        interaction.options.getMember('user') ||
        interaction.options.getUser('user');
    let canKick = false,
      isKickable = false;

    try {
      canKick = await interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]);
      isKickable = target.kickable;

      if (isInGuild && canKick) {
        await interaction.guild.members.kick(target, reason);

        const kick_success = new MessageEmbed()
          .setColor(EMBCOLORS.wrenchHandle)
          .setTitle('**Kicking Wrench Deployed!**')
          .setDescription(`User \`${target.user.tag}\` ${target} is kicked from this server!`)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .addFields([
            {
              name: '**Reason**',
              value: reason
            }
          ])
          .setTimestamp();

        await interaction.editReply({
          embeds: [kick_success]
        });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Kick? ${canKick}\nTarget kickable? ${isKickable}`);
      }
    }
    catch (error) {
      const kick_fail = new MessageEmbed()
        .setColor(EMBCOLORS.error)
        .setTitle('**Cannot Kick...**')
        .setDescription(`User ${target} cannot be kicked :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.`)
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you kick? **\`${canKick}\`**\nTarget kickable? **\`${isKickable}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions. Also make sure the bot role is above that user\'s highest role for this command to work.'
          },
          {
            name: '**Inputs given**',
            value: `User: ${target}  ${
              target.id || target.user.id
            }\nReason: ${reason}`
          },
          {
            name: '**Bot Error Dump**',
            value: `${error}`
          }
        ])
        .setTimestamp();
      await interaction.editReply({
        components: [
          SupportRow,
          InviteRow
        ],
        embeds: [kick_fail]
      });
      console.log(error);
    }
  }
};
