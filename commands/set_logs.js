const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { logsHook } = require('../lib/LogsWebhook.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_logs')
    .setDescription('Set a log channel')
    .addChannelOption((option) =>
      option
        .setName('log_channel')
        .setDescription('Select Log Channel')
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName('force_update')
        .setDescription(
          'Use ONLY in Dire situations. This will overwrite any kind of setting for the server!',
        ),
    ),

  async execute(interaction) {
    const banPerm = Permissions.FLAGS.BAN_MEMBERS;
    await interaction.deferReply();
    const force_update = interaction.options.getBoolean('force_update');

    try {
      const serverDB = await db
        .collection('servers')
        .doc(`${interaction.guild.id}`)
        .get();

      if (!serverDB.exists || force_update) {
        if (interaction.guild) {
          if (interaction.member.permissions.has([banPerm])) {
            const channel = interaction.options.getChannel('log_channel');
            const serverID = interaction.guild.id;
            const channelID = channel.id;

            // console.log('channel', channel);
            // console.log('guildID', serverID);
            // console.log('channelID', channelID);
            // await interaction.editReply('Channel obtained!');
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

            await interaction.editReply(
              `Configured <#${channel.id}> as logging channel.`,
            );
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
            content:
              'This is Server only command. Invite the bot in server to use.',
            components: [InviteRow],
          });
        }
      }
      else {
        const serverData = serverDB.data();
        const logChannel = serverData.logChannel;
        console.log('LogChannel: ', logChannel);
        await interaction.editReply({
          content: `Log channel is already configured to <#${logChannel}>.\nRerun this command with \`force_update\` set to \`True\` if there is some problem.`,
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
