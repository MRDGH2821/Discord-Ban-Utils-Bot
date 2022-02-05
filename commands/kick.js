const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user')
    .addUserOption((option) => option.setName('user').setDescription('Tag a user')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter reason for Kick. Will be sent as DM to user')),

  async execute(interaction) {
    const reason =
        (await interaction.options.getString('reason')) ||
        '||for no reason :joy:||',
      target = await interaction.options.getMember('user');
    //  const tartag = target.user.tag;
    try {
      if (!interaction.guild) {
        await interaction.reply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])
      ) {
        NoPerms.fields = [
          {
            name: '**Permissions Required**',
            value: 'KICK_MEMBERS'
          }
        ];
        await interaction.reply({
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
      // checks if target user can be kicked or not
      else if (target.kickable) {
        // if there is a reason specified, DM it to the user.
        if (reason) {
          try {
            await target.user.send(`Reason for kicking from ${interaction.guild.name}: ${reason}`);
          }
          catch (error) {
            console.log('Reason cannot be DM-ed');
          }
        }
        await interaction.reply({
          // content: `User \`${target.tag}\` is banned from this server. \nReason: ${reas}.`,
          embeds: [
            {
              color: 0x84929f,
              title: '**Kicking Wrench Deployed!**',
              // eslint-disable-next-line sort-keys
              description: `User \`${target.user.tag}\` ${target} is kicked from this server!`,
              thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
              // eslint-disable-next-line sort-keys
              fields: [
                {
                  name: '**Reason**',
                  value: `${reason}`
                }
              ]
            }
          ]
        });
        await target.kick();
      }
      // if user cannot be kicked
      else {
        await interaction.reply({
          // content: 'Kicking Wrench cannot kick...',
          components: [SupportRow],
          embeds: [
            {
              title: '**Cannot Kick...**',
              // eslint-disable-next-line sort-keys
              description: `User ${target} cannot be kicked :grimacing:`,
              // eslint-disable-next-line sort-keys
              color: 0xff0033
            }
          ]
        });
      }
    }
    catch (error) {
      await interaction.reply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\``
      });
    }
  }
};
