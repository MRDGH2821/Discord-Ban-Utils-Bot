const { Permissions, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user_info')
    .setDescription('Display info about yourself.'),
  async execute(interaction) {
    await interaction.deferReply();
    const userInfo = new MessageEmbed()
      // eslint-disable-next-line no-magic-numbers
      .setColor(0xd8d4d3)
      .setTitle('**User info**')
      .setDescription('Displays user information & permissions.')
      .setThumbnail(await interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: '**Username**',
          value: `${interaction.user.tag} ${interaction.user}`
        },
        {
          name: '**User ID (a.k.a. Snowflake value)**',
          value: `${interaction.user.id}`
        }
      );
    try {
      if (interaction.guild) {
        const canBan = interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]),
          canKick = interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]);

        // embed showing details
        userInfo.addFields(
          {
            name: '**Server Name**',
            value: `${interaction.guild.name}`
          },
          {
            name: '**Server ID (a.k.a. Snowflake value)**',
            value: `${interaction.guild.id}`
          },
          {
            name: '**Can you kick?**',
            value: `${canKick}`
          },
          {
            name: '**Can you ban?**',
            value: `${canBan}`
          }
        );
        await interaction.editReply({ embeds: [userInfo] });
      }
      else {
        userInfo.setFooter('User this command in a server to know more details!');
        await interaction.editReply({
          components: [InviteRow],
          embeds: [userInfo]
        });
      }
    }
    catch (error) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\``
      });
    }
  }
};
