const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('mass_ban')
    .setDescription('Mass Bans given IDs')
    .addStringOption((option) =>
      option
        .setName('ids')
        .setDescription('Enter IDs')
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
    const ids = await interaction.options.getString('ids');
    const banReason =
      (await interaction.options.getString('reason')) ||
      `Massbanned by ${interaction.user.tag} on ${new Date().toDateString()}`;

    const notWorking = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('notworking')
        .setLabel('Not working as expected?')
        .setStyle('DANGER'),
    );
    const guildbans = await interaction.guild.bans.fetch();
    //  console.log(bans);
    const alreadybanned = guildbans.map((v) => ({
      user: v.user,
      reason: v.reason,
    }));
    try {
      if (!interaction.guild) {
        await interaction.editReply({
          embeds: [NotInsideServer],
          components: [InviteRow],
        });
      }
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        // User should have ban permissions else it will not work

        (NoPerms.fields = [
          {
            name: '**Permissions required**',
            value: 'BAN_MEMBERS',
          },
        ]),
        await interaction.editReply({
          embeds: [NoPerms],
          components: [InviteRow],
        });
      }
      else {
        await interaction.editReply(
          'Parsing... (If it is taking long time, bot has probably crashed)',
        );

        try {
          const rawEle = ids.split(/\D+/g);
          const bans = rawEle.map((element) => element.trim());
          await interaction.client.users.fetch(bans[0]);
          await interaction.editReply(
            `${bans.length} bans are being banned in background. Sit back and relax for a while!`,
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
          const message = await interaction.editReply({
            content: 'Mass Ban Success!',
            embeds: [
              {
                color: 0xe7890c,
                title: '**Mass Ban Success!**',
                description: `Ban List: ${bans.length}.
                  Invalid Bans: ${bans.length - validBans}.
                  Unique Bans: ${uniqueBans}.\n
                  ${uniqueBans} users mass banned successfully!`,
                fields: [{ name: '**Reason**', value: banReason }],
              },
            ],
            components: [notWorking],
            fetchReply: true,
          });
          const collector = message.createMessageComponentCollector({
            componentType: 'BUTTON',
          });
          collector.on('collect', async (i) => {
            if (i.customId === 'notworking') {
              i.reply({
                content:
                  'You may either upload the list of IDs into https://dpaste.com and use the import command OR follow this [video](https://youtu.be/gxAqukdjtM8)',
                ephemeral: true,
              });
            }
          });
        }
        catch (e) {
          // When the link is invalid. this code prevented earlier versions of crashes.
          await interaction.editReply({
            content: 'Mass Ban Failure...',
            embeds: [
              {
                title: '**Mass Ban Failure...**',
                description: 'There was some unexpected error...',
                color: 0xff0033,
                fields: [
                  {
                    name: '**Error Dump**',
                    value: `${e}`,
                  },
                  {
                    name: '**Input given**',
                    value: ids,
                  },
                ],
              },
            ],
            components: [SupportRow],
          });
        }
      }
    }
    catch (e) {
      await interaction.reply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\`\n\nInput given:\n\`${ids}`,
        components: [SupportRow],
      });
    }
  },
};
