const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { newHook, changeHook } = require('../lib/LogsWebhook.js');
const { NotInsideServer, NoPerms } = require('../lib/ErrorEmbeds.js');

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
    const force_update = await interaction.options.getBoolean('force_update');

    try {
      const serverDB = await db
        .collection('servers')
        .doc(`${interaction.guild.id}`)
        .get();
      const serverData = serverDB.data();

      if (!interaction.guild) {
        await interaction.editReply({
          embeds: [NotInsideServer],
          components: [InviteRow],
        });
      }
      else if (!interaction.member.permissions.has([banPerm])) {
        (NoPerms.fields = {
          name: '**Permissions required**',
          value: 'BAN_MEMBERS',
        }),
        await interaction.editReply({
          embeds: [NoPerms],
          components: [InviteRow],
        });
      }
      else if (!serverDB.exists || force_update) {
        const channel = interaction.options.getChannel('log_channel');
        const serverID = interaction.guild.id;
        const channelID = channel.id;

        // console.log('channel', channel);
        // console.log('guildID', serverID);
        // console.log('channelID', channelID);
        // await interaction.editReply('Channel obtained!');
        let webhook;
        if (!serverDB.exists) {
          webhook = await newHook(channel);
        }
        else {
          const oldChannel = await interaction.client.channels.cache.get(
            serverData.logChannelID,
          );
          try {
            const webhooks = await oldChannel.fetchWebhooks();
            const validHook = webhooks.find((wh) => wh.token);
            webhook = await changeHook(
              interaction.client,
              channel,
              validHook.id,
            );
          }
          catch (e) {
            webhook = await newHook(channel);
          }
        }
        const data = {
          logChannelID: channelID,
          serverID: serverID,
          logWebhookID: webhook.id,
        };
        console.log(data);
        await db
          .collection('servers')
          .doc(`${serverID}`)
          .set(data, { merge: true });

        await interaction.editReply({
          //  content: `Configured <#${channel.id}> as logging channel.`,
          embeds: [
            {
              color: 0xd8d4d3,
              title: '**Log Channel configured!**',
              description: `Configured <#${channel.id}> as logging channel.`,
            },
          ],
        });
      }
      else {
        const logChannel = serverData.logChannelID;
        console.log('LogChannel: ', logChannel);
        await interaction.editReply({
          // content: `Log channel is already configured to <#${logChannel}>.\nRerun this command with \`force_update\` set to \`True\` if there is some problem.`,
          embeds: [
            {
              color: 0xd8d4d3,
              title: '**Log Channel already configured!**',
              description: `Log channel is already configured to <#${logChannel}>.\nRerun this command with \`force_update\` set to \`True\` if there is some problem.`,
            },
          ],
        });
      }
    }
    catch (e) {
      await interaction.editReply({
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
        components: [SupportRow],
      });
    }
  },
};
