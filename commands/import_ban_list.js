/* eslint-disable no-negated-condition */
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { pasteCheck } = require('../lib/PasteBinFnc.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');
const dpst = require('dpaste-ts');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('import_ban_list')
    .setDescription('Imports ban list into current server')
    .addStringOption((option) => option
      .setName('dpaste_link')
      .setDescription('Enter full dpaste link')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter a common reason. (Default is Banned by <you> on <today\'s date>)')),

  async execute(interaction) {
    await interaction.deferReply();
    const banReason =
        (await interaction.options.getString('reason')) ||
        `Ban Import by ${interaction.user.tag} on ${new Date().toDateString()}`,
      paste_id = pasteCheck(await interaction.options.getString('dpaste_link')),
      url = `https://dpaste.com/${paste_id}`;
    try {
      if (!interaction.guild) {
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      // User should have ban permissions else it will not work
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        NoPerms.description =
          'You do not have the required permissions to use this command, hence you cannot just ban anybody by importing 🤷\n\nContact Server Moderators!\nOr invite the bot in your server!';
        NoPerms.fields = [
          {
            name: '**Permissions required**',
            value: 'BAN_MEMBERS'
          },
          {
            name: '**Ban List Link**',
            value: `https://dpaste.com/${paste_id}`
          }
        ];
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
      else {
        //  Console.log(bans);
        const guildbans = await interaction.guild.bans.fetch(),
          previousbans = guildbans.map((ban) => ({
            reason: ban.reason,
            user: ban.user
          })),
          // eslint-disable-next-line new-cap
          source = await dpst.GetRawPaste(paste_id);
        // Console.log(alreadybanned[0]);
        await interaction.editReply('Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)');
        // Console.log(data);
        try {
          const rawEle = source.split(/\D+/gu),
            sourcebans = rawEle.map((element) => element.trim());
          await interaction.client.users.fetch(sourcebans[0]);
          await interaction.editReply(`${sourcebans.length} bans are being imported in background. Sit back and relax for a while!`);
          let uniqueBans = 0,
            validBans = sourcebans.length;
          // Ban users

          /*
           * Console.log(typeof bans);
           * Console.log(bans);
           */
          for (const newban of sourcebans.filter((newPotentialBan) => !previousbans.some((previousban) => previousban.user.id === newPotentialBan))) {
            // eslint-disable-next-line no-await-in-loop
            await interaction.client.users
              .fetch(newban)
              .then(async(user) => {
                console.log('Banning user: ', user.tag);
                await interaction.editReply(`Banning user ${user.tag}...`);
                await interaction.guild.members.ban(user, {
                  reason: banReason
                });
              })
              // eslint-disable-next-line no-loop-func
              .catch((error) => {
                console.log(error);
                // eslint-disable-next-line no-magic-numbers
                validBans -= 1;
                // eslint-disable-next-line no-magic-numbers
                uniqueBans -= 1;
                // ValidBans = validBans - 1;
              });
            // console.log(`Banning user ID ${tag}...`);

            // eslint-disable-next-line no-magic-numbers
            uniqueBans += 1;
          }
          await interaction.editReply({
            content: 'Ban Import Success!',
            embeds: [
              {
                title: '**Ban Import Success!**',
                // eslint-disable-next-line sort-keys
                description: `Ban List: ${sourcebans.length}.\nInvalid Bans: ${
                  sourcebans.length - validBans
                }.\nUnique Bans: ${uniqueBans}.\n${uniqueBans} imported successfully!`,
                // eslint-disable-next-line sort-keys
                color: 0xe7890c,
                fields: [
                  {
                    name: '**Ban List Link**',
                    value: `https://dpaste.com/${paste_id}`
                  },
                  {
                    name: '**Reason**',
                    value: banReason
                  }
                ]
              }
            ]
          });

          interaction.client.emit(
            'importListSuccess',
            interaction,
            url,
            banReason
          );
        }
        catch (error) {
          // When the link is invalid. this code prevented earlier versions of crashes.
          await interaction.editReply({
            content: 'Ban import Failure...',
            embeds: [
              {
                title: '**Ban Import Failure...**',
                // eslint-disable-next-line sort-keys
                description: 'Given dpaste link is invalid...',
                // eslint-disable-next-line sort-keys
                color: 0xff0033,
                fields: [
                  {
                    name: '**Ban List Link**',
                    value: url
                  },
                  {
                    name: '**Dpaste Error Dump**',
                    value: `${source}`
                  },
                  { name: '**Discord Error Dump**',
                    value: `${error}` }
                ]
              }
            ],
            // eslint-disable-next-line sort-keys
            components: [SupportRow]
          });
        }
      }
    }
    catch (error) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\`\n\nInput given:\n${url}`
      });
    }
  }
};
