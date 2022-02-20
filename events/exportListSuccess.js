// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction } = require('discord.js');
const { db } = require('../lib/firebase.js');
const { EMBCOLORS } = require('../lib/Constants.js');

module.exports = {
  name: 'exportListSuccess',

  /**
   * send log after successful export of ban list
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} exportOptions
   * @param {string} exportOptions.url
   * @param {boolean} exportOptions.advanceMode
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { url, advanceMode }) {
    const exportLog = new MessageEmbed()
      .setColor(EMBCOLORS.whiteGray)
      .setTitle('**BU Export Log**')
      .setDescription(`Ban list of this server was just exported!\nExport Requested by ${interaction.user}\nAdvanced mode: **\`${advanceMode}\`**`)
      .addFields([
        {
          name: '**URL**',
          value: url
        }
      ])
      .setTimestamp();
    try {
      const loghook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      loghook.send({ embeds: [exportLog] }).catch(console.error);
      console.log('Webhook fetched from Cache');
    }
    catch (error) {
      const serverDB = await db
        .collection('servers')
        .doc(interaction.guild.id)
        .get();

      if (serverDB.exists) {
        const serverData = serverDB.data(),
          serverWebhook = await interaction.client.fetchWebhook(serverData.logWebhookID);

        serverWebhook.send({ embeds: [exportLog] }).catch(console.error);
        console.log('Webhook fetched from API');
      }
      else {
        console.log(`Logs channel not set in ${interaction.guild.name}`);
      }
      console.log('Error Dump:');
      console.error(error);
    }
  }
};
