/* eslint-disable sort-vars */

const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const { InviteRow } = require('../lib/RowButtons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user_info')
    .setDescription('Display info about given user.')
    .addUserOption((option) => option.setName('user').setDescription('Select user to know info')),

  note: 'If a server member is not found, will show your details. Using in DM will show different yet interesting information',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();

    const user =
      (await interaction.options.getUser('user')) || (await interaction.user);
    try {
      if (interaction.inGuild()) {
        const member =
            (await interaction.options.getMember('user')) ||
            (await interaction.member),
          canBan = await member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]),
          canKick = await member.permissions.has([Permissions.FLAGS.KICK_MEMBERS]),
          canManage = await member.permissions.has([Permissions.FLAGS.MANAGE_GUILD]),
          canTimeout = await member.permissions.has([Permissions.FLAGS.MODERATE_MEMBERS]),
          info_member = new MessageEmbed()
            .setColor('d8d4d3')
            .setTitle('**User info**')
            .setDescription(`Displaying information of ${member.user.tag} ${member} whose Snowflake ID is \`${member.id}\``)
            .setThumbnail(await member.displayAvatarURL({ dynamic: true }))
            .addFields([
              {
                name: '**Permissions check**',
                value: `Can Ban: **\`${canBan}\`**\nCan Kick: **\`${canKick}\`**\nCan Timeout: **\`${canTimeout}\`**\nCan manage server: **\`${canManage}\`**`
              },
              {
                name: '**When did they join Discord?**',
                value: `${time(member.user.createdAt)} i.e. ${time(
                  member.user.createdAt,
                  'R'
                )}`
              },
              {
                name: '**When did they join this server?**',
                value: `${time(member.joinedAt)} i.e. ${time(
                  member.joinedAt,
                  'R'
                )}`
              }
            ]);

        if (member.manageable) {
          info_member.addField(
            '**Can this bot take mod actions on the user?**',
            `**\`${member.manageable}\`**`
          );
        }
        else if (member.user === interaction.client.user) {
          info_member.addField(
            '**Can this bot take mod actions on the user?**',
            `Why would I, ${member} take actions on myself?:joy:`
          );
        }
        else {
          info_member.addField(
            '**Can this bot take mod actions on the user?**',
            `**\`${member.manageable}\`**\n\nTo make this \`true\`, move ${interaction.client.user}'s bot role above the highest role of ${member}. This will not work if ${member} is the owner of ${interaction.guild.name}`
          );
        }

        await interaction.editReply({
          embeds: [info_member]
        });
      }
      else {
        const info_nonmember = new MessageEmbed()
          .setColor('d8d4d3')
          .setTitle('**User info**')
          .setDescription(`Displaying information of ${user.tag} ${user} whose Snowflake ID is \`${user.id}\``)
          .setThumbnail(await user.displayAvatarURL({ dynamic: true }))
          .addFields([
            {
              name: '**When did they join Discord?**',
              value: `${time(user.createdAt)} i.e. ${time(user.createdAt, 'R')}`
            }
          ]);

        if (user === interaction.client.user) {
          info_nonmember.addField(
            '**Can the target invite the bot?**',
            'I wish I could invite myself in servers where there is a need for transferring ban list from one server to another or for exporting ban list of given server. But I must wait ⏰ & be prepared 💪 for such a time to come! 🎉'
          );
        }
        else if (user.bot) {
          info_nonmember.addField(
            '**Can the target invite the bot?**',
            `Unfortunately no, ${user} is a bot it seems`
          );
        }
        else {
          info_nonmember.addField(
            '**Can the target invite the bot?**',
            `Well, they have the ability to invite ${interaction.client.user} atleast...`
          );
        }
        await interaction.editReply({
          components: [InviteRow],
          embeds: [info_nonmember]
        });
      }
    }
    catch (error) {
      const info_nonmember = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot display User info...**')
        .setDescription(`There was some error while displaying information for ${user}\nPlease report Bot Error Dump to developer!`)

        .addFields([
          {
            name: '**Bot error dump**',
            value: `${error}`
          }
        ]);

      await interaction.editReply({
        components: [InviteRow],
        embeds: [info_nonmember]
      });
      console.error(error);
    }
  }
};
