const { Permissions, MessageEmbed } = require('discord.js');
const { createWebhook } = require('../lib/UtilityFunctions');
const { SupportRow, InviteRow } = require('../lib/RowButtons');
const { db } = require('../lib/firebase');
const { SlashCommandBuilder } = require('@discordjs/builders'),
  GUILD_TEXT = 0,
  one = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_logs')
    .setDescription('Set a log channel')
    .addChannelOption((option) => option
      .setName('log_channel')
      .setDescription('Select Log Channel')
      .setRequired(true)
      .addChannelType(GUILD_TEXT)),

  note: 'Type of logs sent: Ban list import-export log, Ban-unban logr & member leaving server log. More type of logs coming soon.',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const channel = await interaction.options.getChannel('log_channel'),
      isInGuild = await interaction.inGuild();
    let canManage = false;

    try {
      canManage =
        (await interaction.member.permissions.has([Permissions.FLAGS.MANAGE_GUILD])) || false;
      if (isInGuild && canManage) {
        const logWebhook = await interaction.guild
            .fetchWebhooks()
            .then(async(webhooks) => {
              const allhooks = await webhooks.filter((wh) => wh.token);
              console.log(allhooks);
              if (allhooks.size > one) {
                const qty = allhooks.size;
                console.log(`Found ${qty} webhooks`);
                allhooks.forEach((hook) => {
                  hook.delete('Redundant webhook');
                });
                throw new Error(`Found ${qty} webhooks. Which are now deleted explictly.`);
              }
              else {
                const hook = allhooks.first();
                console.log(hook);
                hook.edit({
                  channel: channel.id
                });
                return hook;
              }
            })
            .catch((error) => {
              console.error(error);
              console.log('Creating new webhook...');
              return createWebhook(channel);
            }),
          log_set_success = new MessageEmbed()
            .setColor('d8d4d3')
            .setTitle('**Log Channel configured!**')
            .setDescription(`Configured ${channel} for logs.`),
          setDBdata = {
            logChannelID: channel.id,
            logWebhookID: logWebhook.id,
            serverID: interaction.guild.id
          };

        await db
          .collection('servers')
          .doc(interaction.guild.id)
          .set(setDBdata, { merge: true })
          .then(() => console.log('Updated Database!'));

        await interaction.editReply({
          embeds: [log_set_success]
        });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Manage Server? ${canManage}`);
      }
    }
    catch (error) {
      const log_set_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Set logs...**')
        .setDescription('Cannot set logs :grimacing:\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.')
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**\nCan you manage server? **\`${canManage}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server where you have required permissions. Also Make sure the bot has webhooks permissions on given channel.'
          },
          {
            name: '**Inputs given**',
            value: `Channel: ${channel}`
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
        embeds: [log_set_fail]
      });
      console.log(error);
    }
  }
};
