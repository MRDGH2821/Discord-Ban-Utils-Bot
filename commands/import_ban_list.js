const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PasteCheck } = require('../lib/PasteBinFnc.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const dpst = require('dpaste-ts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('import_ban_list')
    .setDescription('Imports ban list into current server')
    .addStringOption((option) =>
      option
        .setName('dpaste_link')
        .setDescription('Enter full dpaste link')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription(
          'Enter a common reason. (Default is Banned by <you> on <today\'s date>)',
        ),
    ),

  async execute(interaction) {
    const guildbans = await interaction.guild.bans.fetch();
    //  console.log(bans);
    const alreadybanned = guildbans.map((v) => ({
      user: v.user,
      reason: v.reason,
    }));
    // console.log(alreadybanned[0]);

    const paste_id = PasteCheck(interaction.options.getString('dpaste_link'));
    const banReason =
      interaction.options.getString('reason') ||
      `Ban Import by ${interaction.user.tag} on ${new Date().toDateString()}`;
    try {
      if (interaction.guild) {
        // User should have ban permissions else it will not work
        if (
          interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
        ) {
          await interaction.reply(
            'Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)',
          );
          const data = await dpst.GetRawPaste(paste_id);
          try {
            const rawEle = data.split(/\D+/g);
            const bans = rawEle.map((element) => element.trim());
            await interaction.client.users.fetch(bans[0]);
            await interaction.editReply(
              `${bans.length} bans are being imported in background. Sit back and relax for a while!`,
            );
            let validBans = bans.length;
            // Ban users

            // console.log(typeof bans);
            // console.log(bans);
            let uniqueBans = 0;
            for (const v of bans.filter(
              (r) => !alreadybanned.some((u) => u.user.id === r),
            )) {
              try {
                const tag = await interaction.client.users
                  .fetch(v)
                  .then((user) => user.tag)
                  .catch(() => {
                    null;
                    // validBans = validBans - 1;
                  });
                console.log(`Banning user ID ${tag}...`);
                await interaction.editReply(`Banning user ${tag}...`);
                await interaction.guild.members.ban(v, {
                  reason: banReason,
                });
              }
              catch {
                validBans = validBans - 1;
              }
              uniqueBans = uniqueBans + 1;
            }
            await interaction.editReply({
              embeds: [
                {
                  title: 'Ban Import',
                  description: `Ban List: ${
                    bans.length
                  }. \nInvalid Bans: ${bans.length -
                    validBans}.\nUnique Bans: ${uniqueBans}.\n${uniqueBans} imported successfully!\n\n`,
                  fields: [
                    { name: 'Ban List Link', value: paste_id },
                    { name: 'Reason', value: banReason },
                  ],
                },
              ],
            });
          }
          catch (e) {
            // When the link is invalid. this code prevented earlier versions of crashes.
            await interaction.editReply({
              content: `Given dpaste link is invalid...\nLink: https://dpaste.com/${paste_id} \nError dump:\n\`${e}\``,
              components: [SupportRow],
            });
          }
        }
        else {
          // When people do not have the permissions to ban.
          await interaction.reply({
            content:
              'You cannot just ban anybody by importing 🤷. Contact Server Moderators!\nOr invite the bot in your server!',
            components: [InviteRow],
          });
        }
      }
      else {
        await interaction.reply({
          content:
            'Are you sure you are in a server to execute this?:unamused:  \nBecause this command can only be used in Server Text channels or Threads :shrug:',
          components: [InviteRow],
        });
      }
    }
    catch (e) {
      await interaction.reply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\`\n\nInput given:\n\`${paste_id}`,
        components: [SupportRow],
      });
    }
  },
};
