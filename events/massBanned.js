const {
  MessageEmbed,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  MessageAttachment
} = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'massBanned',

  /**
   * send mass ban log
   * @async
   * @function execute
   * @param {CommandInteraction} interaction - command interaction object
   * @param {Object} MassBanInfo - mass ban information object
   * @param {string[]} MassBanInfo.listOfIDs - array of IDs
   * @param {string} MassBanInfo.reason - reason for mass ban
   * @param {number} MassBanInfo.invalidBans - number of invalid IDs
   * @param {number} MassBanInfo.uniqueBans - number of Unique ID bans
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { listOfIDs, reason, invalidBans, uniqueBans }) {
    console.log(listOfIDs);

    let stringOfIDs = '';

    for (const id of listOfIDs) {
      if (typeof id === 'string') {
        stringOfIDs = `${stringOfIDs} ${id}`;
      }
    }

    const idsInput = new MessageAttachment(Buffer.from(stringOfIDs))
        .setName(`Input IDs by ${interaction.user.tag}.txt`)
        .setDescription('This is the input given'),
      massban_log = new MessageEmbed()
        .setTitle('**BU Mass Ban Log**')
        .setColor(EMBCOLORS.hammerHandle)
        .setDescription('A list of IDs was just mass banned!')
        .addFields([
          {
            name: '**Mass banned by**',
            value: `${interaction.user.tag} ${interaction.user}`
          },
          {
            name: '**Reason**',
            value: reason
          },
          {
            name: '**Statistics**',
            value: `Invalid IDs: ${invalidBans}\nUnique Bans: ${uniqueBans}`
          }
        ])
        .setTimestamp();

    try {
      const loghook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      loghook
        .send({ embeds: [massban_log], files: [idsInput] })
        .then(() => console.log('Webhook fetched from cache.\nBU Mass ban log sent!'))
        .catch((error) => {
          console.log('BU Mass Ban Log not sent due to error.\nError dump:');
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
          .send({ embeds: [massban_log], files: [idsInput] })
          .then(() => {
            console.log('Webhook fetched from API.\nBU Mass ban log sent!');
          })
          .catch((err) => {
            console.log('BU Mass Ban Log not sent due to error.\nError dump:');
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
