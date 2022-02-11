/* eslint-disable no-await-in-loop */
const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { SupportRow } = require('../lib/RowButtons');
const { pasteCheck } = require('../lib/UtilityFunctions');
const { NUMBER } = require('../lib/Constants');

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

  note: 'For simple import type, provided/default reason is used. For advanced import type, included reason is used. Type of import is automatically detemined.',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();

    let canBan = false,
      isLinkValid = false;

    const inputReason =
        (await interaction.options.getString('reason')) ||
        `Ban Import by ${interaction.user.tag} on ${new Date().toDateString()}`,
      isInGuild = await interaction.inGuild(),
      pasteID = pasteCheck(await interaction.options.getString('dpaste_link')),
      pasteLink = `https://dpaste.com/${pasteID}`,
      remoteSource = await axios(`${pasteLink}.txt`)
        .then((data) => {
          isLinkValid = true;
          return data;
        })
        .catch((error) => {
          isLinkValid = false;
          throw error;
        });

    try {
      canBan = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);

      if (isInGuild && canBan) {
        const finalBanList = [],
          guildbans = await interaction.guild.bans.fetch(),
          previousbans = guildbans.map((ban) => ({
            reason: ban.reason,
            user: ban.user
          })),
          source = remoteSource.data;
        isLinkValid = true;
        // console.log(remoteSource.data);
        await interaction.editReply('Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)');

        let advMode = false,
          bansInList = 0,
          invalidBans = 0,
          modeDesc = '',
          uniqueBans = 0;

        /* console.log('Type of Source:', typeof source);
           console.log('Source: ', source); */
        if (typeof source === String) {
          const rawEle = source.split(/\D+/gu),
            sourceBans = rawEle.map((element) => element.trim());
          advMode = false;
          modeDesc = inputReason;
          bansInList = sourceBans.length;

          await interaction.editReply(`Type of import: Simple.\nInput reason will be used for banning: ${inputReason}\nBan list: ${bansInList}\n\nSit back & relax for a while!`);

          for (const newban of sourceBans.filter((newPotentialBan) => !previousbans.some((previousban) => previousban.user.id === newPotentialBan))) {
            const finalBan = {
              id: newban,
              reason: inputReason
            };
            finalBanList.push(finalBan);
            uniqueBans += NUMBER.one;
          }
        }
        else {
          advMode = true;
          bansInList = source.length;
          modeDesc = `Included reason used for banning. \nFor missing ones input reason was used: ${inputReason}`;

          await interaction.editReply(`Type of import: Advanced.\nIncluded reason will be used for banning. \nFor missing ones input reason will be used: ${inputReason}\nBan list: ${source.length}\n\nSit back & relax for a while!`);

          for (const newban of source.filter((newPotentialBan) => !previousbans.some((previousban) => previousban.user.id === newPotentialBan.id))) {
            const finalBan = {
              id: newban.id,
              // eslint-disable-next-line no-ternary
              reason: (/n+u+l+l/iu).test(newban.reason)
                ? inputReason
                : newban.reason
            };
            finalBanList.push(finalBan);
            uniqueBans += NUMBER.one;
          }
        }

        for (const newBan of finalBanList) {
          // eslint-disable-next-line no-loop-func
          await interaction.client.users.fetch(newBan.id).then(async(user) => {
            console.log('Banning user: ', user.tag);
            await interaction.editReply(`Banning user ${user.tag}...`);
            await interaction.guild.members
              .ban(user, {
                reason: newBan.reason
              })
              .catch((error) => {
                console.log(error);
                invalidBans += NUMBER.one;
                uniqueBans -= NUMBER.one;
              });
          });
        }

        console.log('Final ban list length: ', finalBanList.length);
        console.log('Unique bans: ', uniqueBans);
        console.log('Bans in list: ', bansInList);
        console.log('Invalid bans: ', invalidBans);

        // eslint-disable-next-line one-var
        const import_success = new MessageEmbed()
          .setColor('e7890c')
          .setTitle('**Ban Import Success!**')
          .setDescription(`Bans in list: ${bansInList}\nInvalid Bans: ${invalidBans}\nUnique Bans: ${uniqueBans}\nAdvanced Mode: ${advMode}`)
          .addFields([
            {
              name: '**Ban list link**',
              value: pasteLink
            },
            {
              name: '**Reason**',
              value: modeDesc
            }
          ]);
        interaction.client.emit(
          'importListSuccess',
          interaction,
          pasteLink,
          inputReason,
          advMode
        );
        await interaction.editReply({
          content: 'Ban Import Success!',
          embeds: [import_success]
        });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Ban? ${canBan}\nIs Link valid? ${isLinkValid}`);
      }
    }
    catch (error) {
      const import_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Import...**')
        .setDescription('Cannot import ban list.\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.')
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you ban? **\`${canBan}\`**\nIs Link valid? **\`${isLinkValid}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions. Also make sure the bot role is above most of the public display roles & that the link is valid.'
          },
          {
            name: '**Inputs given**',
            value: `Link: ${pasteLink}\nReason: ${inputReason}`
          },
          {
            name: '**Bot error dump**',
            value: `${error}`
          }
        ]);
      await interaction.editReply({
        components: [SupportRow],
        embeds: [import_fail]
      });
      console.error(error);
    }
  }
};
