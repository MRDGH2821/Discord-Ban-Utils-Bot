// eslint-disable-next-line no-unused-vars
const { Interaction, Guild, MessageEmbed } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'banTransfer',

  /**
   * send ban transfer log on both servers
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} transferInfo
   * @param {number} transferInfo.banDest
   * @param {number} transferInfo.banSource
   * @param {number} transferInfo.bansTransferred
   * @param {Guild} transferInfo.destGuild
   */
  // eslint-disable-next-line sort-keys
  async execute(
    interaction,
    { banDest, banSource, bansTransferred, destGuild }
  ) {
    const transfer_log = new MessageEmbed()
      .setTitle('**BU Ban Transfer Log**')
      .setColor(EMBCOLORS.whiteGray)
      .setDescription(`Source server: ${interaction.guild.name}\nDestination server: ${destGuild.name}`)
      .addFields([
        {
          name: '**Transfer initiated by**',
          value: `${interaction.user.tag} ${interaction.user}`
        },
        {
          name: '**Transfer Statistics**',
          value: `Bans in source: **\`${banSource}\`**\nBans in destination:**\`${banDest}\`**\nUnique Bans: **\`${bansTransferred}\`**`
        }
      ]);
    try {
      const destHook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === destGuild.id),
        sourceHook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      destHook.send({ embeds: [transfer_log] }).catch(console.error);
      sourceHook.send({ embeds: [transfer_log] }).catch(console.error);
      console.log('Webhook fetched from Cache');
    }
    catch (error) {
      const destDB = await db.collection('servers').doc(destGuild.id)
          .get(),
        sourceDB = await db
          .collection('servers')
          .doc(interaction.guild.id)
          .get();

      if (sourceDB.exists) {
        const sourceData = sourceDB.data(),
          sourceWebhook = await interaction.client.fetchWebhook(sourceData.logWebhookID);

        sourceWebhook.send({ embeds: [transfer_log] }).catch(console.error);
        console.log('Webhook fetched from API');
      }
      else {
        console.log(`Logs channel not set in ${interaction.guild.name}`);
      }

      if (destDB.exists) {
        const destData = destDB.data(),
          destWebhook = await interaction.client.fetchWebhook(destData.logWebhookID);

        destWebhook.send({ embeds: [transfer_log] }).catch(console.error);
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
