const { MessageEmbed } = require('discord.js');
const { db } = require('../lib/firebase');

module.exports = {
  name: 'exportListSuccess',

  /**
   * function to execute on 'exportListSuccess' event
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} exportOptions
   * @param {@link} exportOptions.url
   * @param {boolean} exportOptions.advanceMode
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { url, advanceMode }) {
    const exportLog = new MessageEmbed()
      .setColor('d8d4d3')
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

      loghook.send({ embeds: [exportLog] });
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

        serverWebhook.send({ embeds: [exportLog] });
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
