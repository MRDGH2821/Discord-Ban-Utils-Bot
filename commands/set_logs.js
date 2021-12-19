const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { logsHook } = require('../lib/LogsWebhook.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_logs')
    .setDescription('Set a log channel')
    .addChannelOption(option =>
      option
        .setName('log_channel')
        .setDescription('Select Log Channel')
        .setRequired(true),
    )
    .addBooleanOption(option =>
      option
        .setName('force_update')
        .setDescription('Use this option ONLY IF there is a feature update'),
    ),

  async execute(interaction) {
    const banPerm = Permissions.FLAGS.BAN_MEMBERS;
    await interaction.deferReply();
    const force_update = interaction.options.getBoolean('force_update');
    const logChannelExists = await db
      .collection('servers')
      .doc(`${interaction.guild.id}`)
      .get();
    try {
      if (!logChannelExists || force_update) {
        if (interaction.guild) {
          if (interaction.member.permissions.has([banPerm])) {
            const channel = interaction.options.getChannel('log_channel');
            const serverID = interaction.guild.id;
            const channelID = channel.id;

            // console.log('channel', channel);
            //	console.log('guildID', serverID);
            //	console.log('channelID', channelID);
            await interaction.editReply('Channel obtained!');
            const webhook = await logsHook(channel);
            const data = {
              logChannel: channelID,
              serverID: serverID,
              logWebhook: webhook.id,
            };
            console.log(data);
            await db
              .collection('servers')
              .doc(`${serverID}`)
              .set(data);

            await interaction.editReply('Channel set into firebase!');
          }
          else {
            await interaction.editReply({
              content: 'Only Mods with Ban permissions can set this.',
              ephemeral: true,
            });
          }
        }
        else {
          await interaction.editReply({
            content: 'Use this in server',
            components: [InviteRow],
          });
        }
      }
      else {
        const serverData = logChannelExists.data();
        console.log(serverData);
        await interaction.editReply({
          content: `Log channel is already configured to <#${serverData.logChannel}>.\nRerun this command with \`force_update\` set to \`True\``,
        });
      }
    }
    catch (error) {
      await interaction.editReply({
        content: `Unexpected error occured. \n\nError Dump:\n ${error}`,
        components: [SupportRow],
      });
    }
  },
};
