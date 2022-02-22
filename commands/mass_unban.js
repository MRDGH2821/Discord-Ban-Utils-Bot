/* eslint-disable no-await-in-loop */
const {
  Permissions,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageAttachment,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { NUMBER, IDlen, EMBCOLORS } = require('../lib/Constants');
const { SupportRow, InviteRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mass_unban')
    .setDescription('Mass Un-Bans given IDs')
    .addStringOption((option) =>
      option.setName('ids').setDescription('Enter IDs').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription(
          "Enter a common reason. (Default is un-banned by <you> on <today's date>)"
        )
    ),

  note: 'Refer /mass_ban notes',

  /**
   * mass un-ban given IDs
   * @async
   * @function execute
   * @param {CommandInteraction} interaction - interaction object
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const ids = interaction.options.getString('ids'),
      isInGuild = interaction.inGuild(),
      notWorking = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('massban_notworking')
          .setLabel('Not working as expected?')
          .setStyle('DANGER')
      ),
      reason =
        interaction.options.getString('reason') ||
        `Mass un-banned by ${
          interaction.user.tag
        } on ${new Date().toDateString()}`;

    let canUnBan = false,
      sourceListLen = NUMBER.zero;

    try {
      const idList = ids.match(/\d+/gu);

      let sourceList = [];

      if (idList.length > NUMBER.zero) {
        sourceList = Array.from(
          new Set(
            idList.filter(
              (id) => id.length >= IDlen.min && id.length <= IDlen.max
            )
          )
        );
        sourceListLen = sourceList.length;

        if (sourceListLen < NUMBER.zero) {
          throw new Error('Given input does not have Discord IDs');
        }
      } else {
        throw new Error('Given input does not have Discord IDs');
      }

      canUnBan = await interaction.member.permissions.has([
        Permissions.FLAGS.BAN_MEMBERS
      ]);

      if (isInGuild && canUnBan) {
        console.log(sourceList);
        await interaction.editReply(
          `Un-banning ${sourceListLen} users in background. Sit back and relax for a while!`
        );

        let invalidBans = NUMBER.zero;

        for (const newban of sourceList) {
          await interaction.client.users
            .fetch(newban)
            .then(async (user) => {
              console.log('Un-Banning user: ', user.tag);
              await interaction.editReply(`Un-Banning user ${user.tag}...`);
              await interaction.guild.members.unban(user, { reason });
            })
            // eslint-disable-next-line no-loop-func
            .catch((error) => {
              console.error(error);
              invalidBans += NUMBER.one;
            });
        }

        const massUnBan_success = new MessageEmbed()
          .setColor(EMBCOLORS.hammerHandle)
          .setTitle('**Mass Un-Ban Success!**')
          .setDescription(
            `IDs in list: ${sourceListLen}\nInvalid Bans: ${invalidBans}`
          )
          .addFields([
            {
              name: '**Reason**',
              value: `${reason}`
            }
          ])
          .setTimestamp();

        await interaction.editReply({
          components: [notWorking],
          content: 'Mass Ban Success!',
          embeds: [massUnBan_success],
          fetchReply: true
        });
        interaction.client.emit('massUnBanned', interaction, {
          invalidBans,
          listOfIDs: sourceList,
          reason
        });
      }
    } catch (error) {
      const idsInput = new MessageAttachment(Buffer.from(ids))
          .setName(`Input IDs by ${interaction.user.tag}.txt`)
          .setDescription('This is the input given'),
        massUnBan_fail = new MessageEmbed()
          .setColor(EMBCOLORS.error)
          .setTitle('**Cannot Mass Un-Ban...**')
          .setDescription(
            'Cannot mass un-ban.\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.'
          )
          .addFields([
            {
              name: '**Checks**',
              value: `IDs in List: **\`${sourceListLen}\`**\nExecuted In server? **\`${isInGuild}\`**\nCan you un-ban? **\`${canUnBan}\`**`
            },
            {
              name: '**Possible solutions**',
              value:
                'Use this command inside a server where you have required permissions. Also make sure the given input is valid'
            },
            {
              name: '**Inputs given**',
              value: `Given input is attached as file.\nReason: ${reason}`
            },
            {
              name: '**Bot Error Dump**',
              value: `${error}`
            }
          ])
          .setTimestamp();

      await interaction.editReply({
        components: [SupportRow, InviteRow],
        content: 'Mass Un-Ban Failure...',
        embeds: [massUnBan_fail],
        files: [idsInput]
      });
      console.log(error);
    }
  }
};
