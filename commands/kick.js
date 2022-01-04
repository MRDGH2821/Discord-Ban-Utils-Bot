const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Tag a user')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Enter reason for Kick. Will be sent as DM to user'),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason =
      interaction.options.getString('reason') || '||for no reason :joy:||';
    //  const tartag = target.user.tag;
    try {
      if (!interaction.guild) {
        await interaction.reply({
          embeds: [
            {
              color: 0xd8d4d3,
              title: 'Are you in a server?:unamused:',
              description:
                'This command can only be used inside Server :shrug:',
            },
          ],
          components: [InviteRow],
        });
      }
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])
      ) {
        await interaction.reply({
          content: 'You cannot kick...',
          components: [InviteRow],
        });
      }
      // Checks if target user can be kicked or not
      else if (target.kickable) {
        // If there is a reason specified, DM it to the user.
        if (reason) {
          try {
            await target.user.send(
              `Reason for kicking from ${interaction.guild.name}: ${reason}`,
            );
          }
          catch (e) {
            console.log('Reason cannot be DM-ed');
          }
        }
        await interaction.reply({
          // content: `User \`${target.tag}\` is banned from this server. \nReason: ${reas}.`,
          embeds: [
            {
              color: 0x84929f,
              title: 'Kicking Wrench Deployed!',
              description: `User \`${target.user.tag}\` ${target} is kicked from this server!`,
              fields: [
                {
                  name: '**Reason**',
                  value: `${reason}`,
                },
              ],
            },
          ],
        });
        await target.kick();
      }
      // If user cannot be kicked
      else {
        await interaction.reply({
          content: 'Ban import Failure...',
          embeds: [
            {
              title: 'Cannot Kick...',
              description: `User ${target} cannot be kicked :grimacing:`,
              color: 0xff0033,
            },
          ],
          components: [SupportRow],
        });
      }
    }
    catch (e) {
      await interaction.reply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
        components: [SupportRow],
      });
    }
  },
};
