// eslint-disable-next-line no-unused-vars
const { GuildMember, MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'guildMemberUpdate',

  /**
   * send timeout log
   * @async
   * @function execute
   * @param {GuildMember} oldMember
   * @param {GuildMember} newMember
   */
  // eslint-disable-next-line sort-keys
  async execute(oldMember, newMember) {
    if (newMember.isCommunicationDisabled()) {
      const timeout_log = new MessageEmbed()
        .setTitle('**Audit Timeout Log**')
        .setDescription(`${newMember.user.tag} ${
          newMember.user
        } is put on timeout.\nTimeout duration: ${time(newMember.communicationDisabledUntil)} i.e. ${time(newMember.communicationDisabledUntil, 'R')}\nID: \`${
          newMember.user.id
        }\``)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      try {
        const loghook = await newMember.client.webhooksCache.find((webhook) => webhook.guildId === newMember.guild.id);

        loghook.send({ embeds: [timeout_log] });
        console.log('Webhook fetched from Cache');
      }
      catch (error) {
        const serverDB = await db
          .collection('servers')
          .doc(newMember.guild.id)
          .get();

        if (serverDB.exists) {
          const serverData = serverDB.data(),
            serverWebhook = await newMember.client.fetchWebhook(serverData.logWebhookID);

          serverWebhook.send({ embeds: [timeout_log] });
          console.log('Webhook fetched from API');
        }
        else {
          console.log(`Logs channel not set in ${newMember.guild.name}`);
        }
        console.log('Error Dump:');
        console.error(error);
      }
    }
  }
};
