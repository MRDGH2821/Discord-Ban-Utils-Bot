const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const { SupportRow, InviteRow } = require('../lib/RowButtons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user')
    .addUserOption((option) => option.setName('user').setDescription('Tag a user')
      .setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Enter reason for Kick if any.')),

  note: 'Default reason is: Kicked by <you> on <today\'s date>.',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const isInGuild = await interaction.inGuild(),
      reason =
        (await interaction.options.getString('reason')) ||
        `Kicked by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`,
      target = await interaction.options.getMember('user');

    let canKick = false,
      isKickable = false;

    try {
      canKick = await interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]);
      isKickable = target.kickable;

      if (isInGuild && canKick) {
        await interaction.guild.members.kick(target, reason);

        const kick_success = new MessageEmbed()
          .setColor('84929f')
          .setTitle('**Kicking Wrench Deployed!**')
          .setDescription(`User \`${target.user.tag}\` ${target} is kicked from this server!`)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .addFields([
            {
              name: '**Reason**',
              value: reason
            }
          ]);

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
        .setColor('ff0033')
        .setTitle('**Cannot Kick...**')
        .setDescription(`User ${target} cannot be kicked :grimacing:\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.`)
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
            value: `User: ${target}  ${target.id}\nReason: ${reason}`
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
        embeds: [kick_fail]
      });
      console.log(error);
    }
  }
};
