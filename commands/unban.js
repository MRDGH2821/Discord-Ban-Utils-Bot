const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { SupportRow, InviteRow } = require('../lib/RowButtons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('Enter the User ID (i.e. snowflake)')
      .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const isInGuild = await interaction.inGuild(),
      target = await interaction.options.getUser('user');
    let canUnban = false;
    try {
      canUnban = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);
      if (isInGuild && canUnban) {
        await interaction.guild.members.unban(target);

        // eslint-disable-next-line one-var
        const unban_success = new MessageEmbed()
          .setTitle('**User Unbanned!**')
          .setColor('e1870a')
          .setDescription(`User \`${target.tag}\` ${target} is unbanned from this server.\nID: \`${target.id}\``)
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        await interaction.editReply({
          embeds: [unban_success]
        });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Unban? ${canUnban}`);
      }
    }
    catch (error) {
      const unban_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Unban...**')
        .setDescription(`User ${target} cannot be unbanned :grimacing:\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.`)
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you unban? **\`${canUnban}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions.'
          },
          {
            name: '**Inputs given**',
            value: `User: ${target}  \`${target.id}\``
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
        embeds: [unban_fail]
      });
      console.error(error);
    }
  }
};
