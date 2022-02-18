const { MessageEmbed } = require('discord.js');
const { db } = require('../lib/firebase');

module.exports = {
  name: 'guildBanRemove',

  // eslint-disable-next-line sort-keys
  async execute(member) {
    const unbanLog = new MessageEmbed()
      .setTitle('**Audit Unban Log**')
      .setColor('d8d4d3')
      .setDescription(`${member.user.tag} ${member.user} is unbanned from the server\nID: \`${member.user.id}\``)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    try {
      const loghook = await member.client.webhooksCache.find((webhook) => webhook.guildId === member.guild.id);

      loghook.send({ embeds: [unbanLog] });
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

        serverWebhook.send({ embeds: [unbanLog] });
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
