const {
  MessageEmbed,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  MessageAttachment
} = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'massUnBanned',

  /**
   * send mass ban log
   * @async
   * @function execute
   * @param {CommandInteraction} interaction - Command interaction object
   * @param {Object} MassBanInfo - Mass ban information
   * @param {string[]} MassBanInfo.listOfIDs - Array of IDs
   * @param {string} MassBanInfo.reason - Reason for mass ban
   * @param {number} MassBanInfo.invalidBans - Number of invalid IDs
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { listOfIDs, reason, invalidBans }) {
    let stringOfIDs = '';

    for (const id of listOfIDs) {
      // if (typeof id === 'string')

      stringOfIDs = `${stringOfIDs} ${id}`;
    }
    const idsInput = new MessageAttachment(Buffer.from(stringOfIDs))
        .setName(`Input IDs by ${interaction.user.tag}.txt`)
        .setDescription('This is the input given'),
      massUnBan_log = new MessageEmbed()
        .setTitle('**BU Mass Un-Ban Log**')
        .setColor(EMBCOLORS.hammerHandle)
        .setDescription('A list of IDs was just mass un-banned!')
        .addFields([
          {
            name: '**Mass un-banned by**',
            value: `${interaction.user.tag} ${interaction.user}`
          },
          {
            name: '**Reason**',
            value: reason
          },
          {
            name: '**Statistics**',
            value: `Invalid IDs: ${invalidBans}`
          }
        ])
        .setTimestamp();

    try {
      const loghook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      loghook
        .send({ embeds: [massUnBan_log], files: [idsInput] })
        .then(() => console.log('Webhook fetched from cache.\nBU Mass Un-Ban log sent!'))
        .catch((error) => {
          console.log('BU Mass Un-Ban Log not sent due to error.\nError dump:');
          console.error(error);
          throw error;
        });
    }
    catch (error) {
      const serverDB = await db
        .collection('servers')
        .doc(interaction.guild.id)
        .get();

      if (serverDB.exists) {
        const serverData = serverDB.data(),
          serverWebhook = await interaction.client.fetchWebhook(serverData.logWebhookID);

        serverWebhook
          .send({ embeds: [massUnBan_log] })
          .then(() => {
            console.log('Webhook fetched from API.\nBU Un-Mass ban log sent!');
          })
          .catch((err) => {
            console.log('BU Mass Un-Ban Log not sent due to error.\nError dump:');
            console.error(err);
          });
      }
      else {
        console.log(`Logs channel not set in ${interaction.guild.name}`);
      }
      console.log('Other Error Dump:');
      console.error(error);
    }
  }
};
