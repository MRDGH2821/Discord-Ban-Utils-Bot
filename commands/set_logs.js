const {
  Permissions,
  MessageEmbed,
  Constants,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');
const { NUMBER, EMBCOLORS } = require('../lib/Constants.js');
const { createWebhook } = require('../lib/UtilityFunctions.js');
const { SupportRow, InviteRow } = require('../lib/RowButtons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_logs')
    .setDescription('Set a log channel')
    .addChannelOption((option) => option
      .setName('log_channel')
      .setDescription('Select Log Channel')
      .setRequired(true)
      .addChannelType(Constants.ChannelTypes.GUILD_TEXT)),

  note: 'Type of logs sent: \n1. Ban list import-export log \n2. Ban-Unban & Timeout log  \n3. Member leaving server log \n4. Ban transfer log\nMore type of & detailed logs coming soon.',

  /**
   * set a logs channel
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    await interaction.deferReply();
    const channel = interaction.options.getChannel('log_channel'),
      isInGuild = interaction.inGuild(),
      logsProgress = new MessageEmbed()
        .setColor(EMBCOLORS.whiteGray)
        .setTitle('**Setting up Log Channel**')
        .setDescription(`Configuring ${channel} for logs.\nAfter configuration success, a log message should come in that channel.`)
        .setTimestamp();
    let canManage = false;

    try {
      canManage =
        (await interaction.member.permissions.has([Permissions.FLAGS.MANAGE_GUILD])) || false;
      if (isInGuild && canManage) {
        await interaction.editReply({
          embeds: [
            logsProgress
              .addField(
                'Step 1',
                'Checking if there are any existing webhooks...'
              )
              .setTimestamp()
          ]
        });
        const logWebhook = await interaction.guild
            .fetchWebhooks()
            .then(async(webhooks) => {
              const allhooks = webhooks.filter((wh) => wh.owner === interaction.client.user);
              // console.log(allhooks);
              if (allhooks.size > NUMBER.one) {
                await interaction.editReply({
                  embeds: [
                    logsProgress
                      .addField('Step 2', 'Deleting duplicate webhooks...')
                      .setTimestamp()
                  ]
                });
                const qty = allhooks.size;
                console.log(`Found ${qty} webhooks`);
                allhooks.forEach((hook) => {
                  hook.delete('Redundant webhook');
                });
                throw new Error(`Found ${qty} webhooks. Which are now deleted explicitly.`);
              }
              else {
                await interaction.editReply({
                  embeds: [
                    logsProgress
                      .addField(
                        'Step 2',
                        'Editing target channel of webhook...'
                      )
                      .setTimestamp()
                  ]
                });
                const hook = allhooks.first();
                // console.log(hook);
                hook.edit({
                  channel: channel.id
                });
                return hook;
              }
            })
            .catch(async(error) => {
              await interaction.editReply({
                embeds: [
                  logsProgress
                    .addField('Step 2.5', 'Creating new webhook...')
                    .setTimestamp()
                ]
              });
              console.error(error);
              console.log('Creating new webhook...');
              return createWebhook(channel);
            }),
          log_sample = new MessageEmbed()
            .setColor(EMBCOLORS.invisible)
            .setTitle('Test msg via command')
            .setDescription(`This is a test log, should come in ${channel}.\nThis is sent when the log channel is set via command.`)
            .setTimestamp(),
          setDBdata = {
            logChannelID: channel.id,
            logWebhookID: logWebhook.id,
            serverID: interaction.guild.id
          };

        await interaction.editReply({
          embeds: [logsProgress.addField('Step 3', 'Saving data...').setTimestamp()]
        });
        await db
          .collection('servers')
          .doc(interaction.guild.id)
          .set(setDBdata, { merge: true })
          .then(() => console.log('Updated Database!'));

        await interaction.editReply({
          embeds: [
            logsProgress
              .setTitle('**Log Channel configured!**')
              .addField('Success!', `Configured ${channel} for logs.`)
              .setTimestamp()
          ]
        });

        logWebhook.send({ embeds: [log_sample] });
      }
      else {
        throw new Error(`Inside server? ${isInGuild}\nCan Manage Server? ${canManage}`);
      }
    }
    catch (error) {
      const log_set_fail = new MessageEmbed()
        .setColor(EMBCOLORS.error)
        .setTitle('**Cannot Set logs...**')
        .setDescription('Cannot set logs :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.')
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
        ])
        .setTimestamp();

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
