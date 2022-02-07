/* eslint-disable no-negated-condition */
const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');
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
    const guildbans = await interaction.guild.bans.fetch(),
      ids = await interaction.options.getString('ids'),
      notWorking = new MessageActionRow().addComponents(new MessageButton()
        .setCustomId('notworking')
        .setLabel('Not working as expected?')
        .setStyle('DANGER')),
      previousbans = guildbans.map((ban) => ({
        reason: ban.reason,
        user: ban.user
      })),
      reasonForBan =
        (await interaction.options.getString('reason')) ||
        `Massbanned by ${interaction.user.tag} on ${new Date().toDateString()}`;
    try {
      if (!interaction.guild) {
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (
        !interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
      ) {
        // user should have ban permissions else it will not work

        NoPerms.fields = [
          {
            name: '**Permissions required**',
            value: 'BAN_MEMBERS'
          }
        ];
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
      else {
        await interaction.editReply('Parsing... (If it is taking long time, bot has probably crashed)');

        try {
          const rawEle = ids.split(/\D+/gu),
            sourcebans = rawEle.map((element) => element.trim());
          await interaction.client.users.fetch(sourcebans[0]);
          await interaction.editReply(`${sourcebans.length} bans are being banned in background. Sit back and relax for a while!`);
          let uniqueBans = 0,
            validBans = sourcebans.length;
          // ban users

          /* console.log(typeof bans);
             Console.log(bans); */
          for (const newban of sourcebans.filter((newPotentialBan) => !previousbans.some((previousBan) => previousBan.user.id === newPotentialBan))) {
            // eslint-disable-next-line no-await-in-loop
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
                console.log(error);
                // eslint-disable-next-line no-magic-numbers
                validBans -= 1;
                // eslint-disable-next-line no-magic-numbers
                uniqueBans -= 1;
                // validBans = validBans - 1;
              });
            // console.log(`Banning user ID ${tag}...`);

            // eslint-disable-next-line no-magic-numbers
            uniqueBans += 1;
          }
          // eslint-disable-next-line one-var
          const message = await interaction.editReply({
              components: [notWorking],
              content: 'Mass Ban Success!',
              embeds: [
                {
                  color: 0xe7890c,
                  title: '**Mass Ban Success!**',
                  // eslint-disable-next-line sort-keys
                  description: `Ban List: ${sourcebans.length}.
                  Invalid Bans: ${sourcebans.length - validBans}.
                  Unique Bans: ${uniqueBans}.\n
                  ${uniqueBans} users mass banned successfully!`,
                  fields: [
                    { name: '**Reason**',
                      value: reasonForBan }
                  ]
                }
              ],
              fetchReply: true
            }),
            // eslint-disable-next-line sort-vars
            collector = message.createMessageComponentCollector({
              componentType: 'BUTTON'
            });
          collector.on('collect', async(interacted) => {
            if (interacted.customId === 'notworking') {
              await interacted.reply({
                content:
                  'You may either upload the list of IDs into https://dpaste.com and use the import command OR follow this [video](https://youtu.be/gxAqukdjtM8)',
                ephemeral: true
              });
            }
          });
        }
        catch (error) {
          // when the link is invalid. this code prevented earlier versions of crashes.
          await interaction.editReply({
            components: [SupportRow],
            content: 'Mass Ban Failure...',
            embeds: [
              {
                title: '**Mass Ban Failure...**',
                // eslint-disable-next-line sort-keys
                description: 'There was some unexpected error...',
                // eslint-disable-next-line sort-keys
                color: 0xff0033,
                fields: [
                  {
                    name: '**Error Dump**',
                    value: `${error}`
                  },
                  {
                    name: '**Input given**',
                    value: ids
                  }
                ]
              }
            ]
          });
        }
      }
    }
    catch (error) {
      await interaction.reply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\`\n\nInput given:\n\`${ids}`
      });
    }
  }
};
