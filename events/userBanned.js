const { db } = require('../lib/firebase.js');
const { WebhookClient, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'userBanned',
  async execute(mod, bannedUser, reason, guild) {
    /*
		console.log('Moderator: ', mod);
		console.log('Banned user: ', bannedUser);
		console.log('Reason: ', reason);
		console.log('Guild: ', guild);
    */
    const serverDB = await db
      .collection('servers')
      .doc(`${guild.id}`)
      .get();
    const serverData = serverDB.data();
    console.log('Doc data: ', serverData);
    /* serverData format:
		{
		logChannel: <channel ID>,
		logWebhook: <webhook ID>,
		serverID: <server ID>
  	}
		*/
    console.log('logWebHookID: ', serverData.logWebhook);
    const webhookID = serverData.logWebhook;
    try {
      if (webhookID) {
        const channel = guild.channels.cache.get(serverData.logChannel);

        const webhooks = await channel.fetchWebhooks();
        const token = webhooks.find(wh => wh.token);

        const webhookClient = new WebhookClient({
          id: webhookID,
          token: token,
        });
        const logEmb = new MessageEmbed()
          .setColor('#D8D4D3')
          .setTitle('**Ban Log**')
          .setDescription('A person got hit with the swift hammer of justice!')
          .addFields(
            {
              name: '**Moderator who wielded the mighty hammer of justice**',
              value: mod.tag,
            },
            { name: '**Justice Hammer Target**', value: bannedUser.tag },
            {
              name: '**Reason**',
              value: reason,
            },
          )
          .setTimestamp();
        webhookClient.send({
          embeds: [logEmb],
        });
      }
    }
    catch (error) {
      console.log(error);
    }
  },
};
