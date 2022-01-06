const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PasteCheck } = require('../lib/PasteBinFnc.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');
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
    await interaction.deferReply();
    const paste_id = PasteCheck(interaction.options.getString('dpaste_link'));
    const banReason =
      interaction.options.getString('reason') ||
      `Ban Import by ${interaction.user.tag} on ${new Date().toDateString()}`;
    try {
      if (!interaction.guild) {
        await interaction.editReply({
          embeds: [NotInsideServer],
          components: [InviteRow],
        });
      }
      // User should have ban permissions else it will not work
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        NoPerms.description =
          'You do not have the required permissions to use this command, hence you cannot just ban anybody by importing 🤷\n\nContact Server Moderators!\nOr invite the bot in your server!';
        (NoPerms.fields = [
          {
            name: '**Permissions required**',
            value: 'BAN_MEMBERS',
          },
          {
            name: '**Ban List Link**',
            value: `https://dpaste.com/${paste_id}`,
          },
        ]),
        await interaction.editReply({
          embeds: [NoPerms],
          components: [InviteRow],
        });
      }
      else {
        const guildbans = await interaction.guild.bans.fetch();
        //  console.log(bans);
        const alreadybanned = guildbans.map((v) => ({
          user: v.user,
          reason: v.reason,
        }));
        // console.log(alreadybanned[0]);
        await interaction.editReply(
          'Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)',
        );
        const data = await dpst.GetRawPaste(paste_id);
        // console.log(data);
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
            content: 'Ban Import Success!',
            embeds: [
              {
                title: 'Ban Import Success!',
                description: `Ban List: ${bans.length}.
                Invalid Bans: ${bans.length - validBans}.
                Unique Bans: ${uniqueBans}.
                ${uniqueBans} imported successfully!`,
                color: 0xe7890c,
                fields: [
                  {
                    name: 'Ban List Link',
                    value: `https://dpaste.com/${paste_id}`,
                  },
                  {
                    name: 'Reason',
                    value: banReason,
                  },
                ],
              },
            ],
          });
        }
        catch (error) {
          // When the link is invalid. this code prevented earlier versions of crashes.
          await interaction.editReply({
            content: 'Ban import Failure...',
            embeds: [
              {
                title: 'Ban Import Failure...',
                description: 'Given dpaste link is invalid...',
                color: 0xff0033,
                fields: [
                  {
                    name: 'Ban List Link',
                    value: `https://dpaste.com/${paste_id}`,
                  },
                  {
                    name: 'Dpaste Error Dump',
                    value: `${data}`,
                  },
                  { name: 'Discord Error Dump', value: `${error}` },
                ],
              },
            ],
            components: [SupportRow],
          });
        }
      }
    }
    catch (e) {
      await interaction.editReply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\`\n\nInput given:\nhttps://dpaste.com/${paste_id}`,
        components: [SupportRow],
      });
    }
  },
};
