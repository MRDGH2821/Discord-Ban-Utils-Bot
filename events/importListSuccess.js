// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction } = require('discord.js');
const { db } = require('../lib/firebase.js');
const { EMBCOLORS } = require('../lib/Constants.js');

module.exports = {
  name: 'importListSuccess',

  /**
   * send log after successful import of ban list
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} importOptions
   * @param {@link} importOptions.url
   * @param {string} importOptions.reason
   * @param {boolean} importOptions.advanceMode
   * @param {number} importOptions.uniqueBans
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { url, reason, advanceMode, uniqueBans }) {
    const importLog = new MessageEmbed()
      .setTitle('**BU Import Log**')
      .setColor(EMBCOLORS.hammerHandle)
      .setDescription(`Ban list of this server was just imported!\nImported by \`${interaction.user.tag}\` ${interaction.user}\nAdvanced mode: **\`${advanceMode}\`**\nUnique Bans: ${uniqueBans}`)
      .addFields([
        {
          name: '**URL**',
          value: url
        },
        {
          name: '**Reason**',
          value: `${reason}`
        }
      ])
      .setTimestamp();

    try {
      const loghook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      loghook.send({ embeds: [importLog] }).catch(console.error);
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

        serverWebhook.send({ embeds: [importLog] }).catch(console.error);
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
