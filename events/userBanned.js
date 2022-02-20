// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require('discord.js');
const { db } = require('../lib/firebase.js');
const { EMBCOLORS } = require('../lib/Constants.js');
module.exports = {
  name: 'userBanned',

  /**
   * send log when user is banned via bot
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   * @param {Object} BUBanOptions
   * @param {string} BUBanOptions.reason
   * @param {number} BUBanOptions.daysOfMsgs
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { reason, daysOfMsgs }) {
    const bannedUser = interaction.options.getUser('user'),
      embedBanLog = new MessageEmbed()
        .setTitle('**BU Ban Log**')
        .setColor(EMBCOLORS.hammerHandle)
        .setDescription(`\`${bannedUser.tag}\` ${bannedUser} got hit with the swift hammer of justice!\nID: \`${bannedUser.id}\`\nDays of messages deleted: ${daysOfMsgs}`)
        .setThumbnail(bannedUser.displayAvatarURL({ dynamic: true }))
        .addFields([
          {
            name: '**Justice Ban Hammer Wielder**',
            value: `${interaction.user.tag} ${interaction.user}`
          },
          {
            name: '**Ban Reason**',
            value: `${reason}`
          }
        ])
        .setTimestamp();

    try {
      const loghook = await interaction.client.webhooksCache.find((webhook) => webhook.guildId === interaction.guild.id);

      loghook.send({ embeds: [embedBanLog] }).catch(console.error);
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

        serverWebhook.send({ embeds: [embedBanLog] }).catch(console.error);
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
