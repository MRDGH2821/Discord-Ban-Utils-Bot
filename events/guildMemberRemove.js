// eslint-disable-next-line no-unused-vars
const { MessageEmbed, GuildMember } = require('discord.js');
const { time } = require('@discordjs/builders');
const { db } = require('../lib/firebase.js');
const { EMBCOLORS } = require('../lib/Constants.js');

module.exports = {
  name: 'guildMemberRemove',

  /**
   * send a log when member leaves server
   * @async
   * @function execute
   * @param {GuildMember} member
   */
  // eslint-disable-next-line sort-keys
  async execute(member) {
    const exitLog = new MessageEmbed()
      .setTimestamp()
      .setTitle('**Audit Exit Log**')
      .setColor(EMBCOLORS.wrenchHandle)
      .setDescription(`${member.user.tag} ${member} left the server.\nID: \`${member.user.id}\``)
      .addFields([
        {
          name: '**Joined at**',
          value: time(member.joinedAt)
        }
      ]);

    try {
      const loghook = await member.client.webhooksCache.find((webhook) => webhook.guildId === member.guild.id);

      loghook.send({ embeds: [exitLog] });
      console.log('Webhook fetched from Cache');
    }
    catch (error) {
      const serverDB = await db
        .collection('servers')
        .doc(member.guild.id)
        .get();

      if (serverDB.exists) {
        const serverData = serverDB.data(),
          serverWebhook = await member.client.fetchWebhook(serverData.logWebhookID);

        serverWebhook.send({ embeds: [exitLog] });
        console.log('Webhook fetched from API');
      }
      else {
        console.log(`Logs channel not set in ${member.guild.name}`);
      }
      console.log('Error Dump:');
      console.error(error);
    }
  }
};
