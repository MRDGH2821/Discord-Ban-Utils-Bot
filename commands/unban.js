const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');

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
    const target = await interaction.options.getUser('user');
    try {
      if (!interaction.guild) {
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (
        interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        await interaction.guild.members.unban(target);
        await interaction.editReply({
          embeds: [
            {
              color: 0xe1870a,
              title: '**User Unbanned!**',
              // eslint-disable-next-line sort-keys
              description: `User \`${target.tag}\` ${target} is unbanned from this server.`,
              thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
              timestamp: new Date(),
              // eslint-disable-next-line sort-keys
              footer: {
                text: `${target.id}`
              }
            }
          ]
        });
      }
      else {
        // When no ban permissions
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
    catch (error) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\``
      });
    }
  }
};
