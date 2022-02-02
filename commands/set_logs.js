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
    .addChannelOption((option) => option
      .setName('log_channel')
      .setDescription('Select Log Channel')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('force_update')
      .setDescription('Use ONLY in Dire situations. This will overwrite any kind of setting for the server!')),

  async execute(interaction) {
    await interaction.deferReply();
    const banPerm = Permissions.FLAGS.BAN_MEMBERS,
      force_update = await interaction.options.getBoolean('force_update');

    try {
      const serverDB = await db
          .collection('servers')
          .doc(`${interaction.guild.id}`)
          .get(),
        serverData = serverDB.data();

      if (!interaction.guild) {
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NotInsideServer]
        });
      }
      else if (!interaction.member.permissions.has([banPerm])) {
        NoPerms.fields = {
          name: '**Permissions required**',
          value: 'BAN_MEMBERS'
        };
        await interaction.editReply({
          components: [InviteRow],
          embeds: [NoPerms]
        });
      }
      else if (!serverDB.exists || force_update) {
        const channel = interaction.options.getChannel('log_channel'),
          channelID = channel.id;
        // serverID = interaction.guild.id;

        /*
         * Console.log('channel', channel);
         * Console.log('guildID', serverID);
         * Console.log('channelID', channelID);
         * Await interaction.editReply('Channel obtained!');
         */
        // eslint-disable-next-line init-declarations
        let data, webhook;
        try {
          // eslint-disable-next-line init-declarations
          let webhooks;
          if (serverData.logChannelID) {
            const oldChannel = await interaction.client.channels.cache.get(serverData.logChannelID);
            webhooks = await oldChannel.fetchWebhooks();
          }
          else {
            webhooks = await interaction.guild.fetchWebhooks();
          }
          const validHook = webhooks.find((wh) => wh.token);
          webhook = await changeHook(interaction.client, channel, validHook.id);

          data = {
            logChannelID: channelID,
            logWebhookID: webhook.id,
            serverID: interaction.guild.id
          };
        }
        catch (error) {
          console.log(error);
          webhook = await newHook(channel);
          data = {
            logChannelID: channelID,
            logWebhookID: webhook.id,
            serverID: interaction.guild.id
          };
        }
        console.log(data);
        await db
          .collection('servers')
          .doc(`${interaction.guild.id}`)
          .set(data, { merge: true });

        await interaction.editReply({
          //  Content: `Configured <#${channel.id}> as logging channel.`,
          embeds: [
            {
              color: 0xd8d4d3,
              title: '**Log Channel configured!**',
              // eslint-disable-next-line sort-keys
              description: `Configured <#${channel.id}> as logging channel.`
            }
          ]
        });
      }
      else {
        const logChannel = serverData.logChannelID;
        console.log('LogChannel: ', logChannel);
        await interaction.editReply({
          // Content: `Log channel is already configured to <#${logChannel}>.\nRerun this command with \`force_update\` set to \`True\` if there is some problem.`,
          embeds: [
            {
              color: 0xd8d4d3,
              title: '**Log Channel already configured!**',
              // eslint-disable-next-line sort-keys
              description: `Log channel is already configured to <#${logChannel}>.\nRerun this command with \`force_update\` set to \`True\` if there is some problem.`
            }
          ]
        });
      }
    }
    catch (error) {
      await interaction.editReply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\``
      });
    }
  }
};
