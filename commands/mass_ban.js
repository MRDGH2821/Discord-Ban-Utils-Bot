/* eslint-disable no-await-in-loop */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CreatePaste } = require('dpaste-ts');
const { SupportRow, InviteRow } = require('../lib/RowButtons');
const {
    Permissions,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageAttachment
  } = require('discord.js'),
  expiry = 3,
  futureIDlen = 19,
  minIDlen = 17,
  one = 1,
  zero = 0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mass_ban')
    .setDescription('Mass Bans given IDs')
    .addStringOption((option) => option.setName('ids').setDescription('Enter IDs')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('reason')
      .setDescription('Enter a common reason. (Default is Banned by <you> on <today\'s date>)')),

  async execute(interaction) {
    await interaction.deferReply();
    const ids = await interaction.options.getString('ids'),
      notWorking = new MessageActionRow().addComponents(new MessageButton()
        .setCustomId('massban_notworking')
        .setLabel('Not working as expected?')
        .setStyle('DANGER')),
      reasonForBan =
        (await interaction.options.getString('reason')) ||
        `Massbanned by ${
          interaction.user.tag
        } on ${new Date().toDateString()} ||for no reason :joy:||`;

    let canBan = false,
      isInGuild = interaction.inGuild(),
      sourceListLen = zero;

    try {
      const currentBanList = await interaction.guild.bans.fetch(),
        currentBanListProcessed = currentBanList.map((ban) => ({
          reason: ban.reason,
          user: ban.user
        })),
        idList = ids.match(/\d+/gu);

      let sourceList = [],
        sourceURL = '';

      if (idList.length > zero) {
        sourceList = idList.filter((id) => id.length >= minIDlen && id.length <= futureIDlen);
        sourceListLen = sourceList.length;

        if (sourceListLen > zero) {
          // eslint-disable-next-line new-cap
          sourceURL = await CreatePaste(
            sourceList,
            `Mass ban list by ${interaction.user.tag} on ${new Date()}.txt`,
            'text',
            expiry
          );
        }
        else {
          throw new Error('Given input does not have Discord IDs');
        }
      }
      else {
        throw new Error('Given input does not have Discord IDs');
      }

      canBan = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);
      isInGuild = await interaction.guild;

      if (isInGuild && canBan) {
        console.log(sourceList);
        await interaction.editReply(`${sourceListLen} bans are being banned in background. Sit back and relax for a while!`);

        let invalidBans = zero,
          uniqueBans = zero;

        for (const newban of sourceList.filter((newPotentialBan) => !currentBanListProcessed.some((previousBan) => previousBan.user.id === newPotentialBan))) {
          uniqueBans += one;
          await interaction.client.users
            .fetch(newban)
            .then(async(user) => {
              console.log('Banning user: ', user.tag);
              await interaction.editReply(`Banning user ${user.tag}...`);
              await interaction.guild.members.ban(user, {
                reason: reasonForBan
              });
            })
            // eslint-disable-next-line no-loop-func
            .catch((error) => {
              console.error(error);
              invalidBans += one;
              uniqueBans -= one;
            });
        }

        const massBan_success = new MessageEmbed()
          .setColor('e7890c')
          .setTitle('**Mass Ban Success!**')
          .setDescription(`Bans in list: ${sourceListLen}\nInvalid Bans: ${invalidBans}\nUnique Bans: ${uniqueBans}`)
          .addFields([
            {
              name: '**Reason**',
              value: `${reasonForBan}`
            },
            {
              name: '**Massban List**',
              value: `${sourceURL}`
            }
          ]);

        await interaction.editReply({
          components: [notWorking],
          content: 'Mass Ban Success!',
          embeds: [massBan_success],
          fetchReply: true
        });
      }
    }
    catch (error) {
      const idsInput = new MessageAttachment(Buffer.from(ids))
          .setName(`Input IDs by ${interaction.user.tag}.txt`)
          .setDescription('This is the input given'),
        massBan_fail = new MessageEmbed()
          .setColor('ff0033')
          .setTitle('**Cannot Mass Ban...**')
          .setDescription('Cannot mass ban.\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.')
          .addFields([
            {
              name: '**Checks**',
              value: `IDs in List: **\`${sourceListLen}\`**\nExecuted In server? **\`${isInGuild}\`**\nCan you ban? **\`${canBan}\`**`
            },
            {
              name: '**Possible solutions**',
              value:
                'Use this command inside a server where you have required permissions. Also make sure the bot role is above most of the public display roles & that the given input is valid'
            },
            {
              name: '**Inputs given**',
              value: `Given input is attached as file.\nReason: ${reasonForBan}`
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
        content: 'Mass Ban Failure...',
        embeds: [massBan_fail],
        files: [idsInput]
      });
      console.log(error);
    }
  }
};
