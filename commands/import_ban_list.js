const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const dpst = require('dpaste-ts');
const { SupportRow } = require('../lib/RowButtons');
const { pasteCheck } = require('../lib/UtilityFunctions');

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
    const inputReason =
        (await interaction.options.getString('reason')) ||
        `Ban Import by ${interaction.user.tag} on ${new Date().toDateString()}`,
      paste_id = pasteCheck(await interaction.options.getString('dpaste_link')),
      url = `https://dpaste.com/${paste_id}`;

    let canBan = false,
      isInGuild = false;

    try {
      canBan = await interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]);
      isInGuild = await interaction.guild;

      if (isInGuild && canBan) {
        const guildbans = await interaction.guild.bans.fetch(),
          previousbans = guildbans.map((ban) => ({
            reason: ban.reason,
            user: ban.user
          })),
          // eslint-disable-next-line new-cap
          remoteSource = await dpst.GetRawPaste(paste_id),
          source = JSON.parse(remoteSource);
        console.log(remoteSource);
        await interaction.editReply('Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)');

        if (typeof source === Array) {
          console.log(typeof source);
          console.log(source);
        }
        else {
          console.log(typeof source);
          console.log(source);
        }
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Ban? ${canBan}`);
      }
    }
    catch (error) {
      const import_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Import...**')
        .setDescription('Cannot import ban list.')
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you ban? **\`${canBan}\`**`
          },
          {
            name: '**Inputs given**',
            value: `Link: ${url}\nReason: ${inputReason}`
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
