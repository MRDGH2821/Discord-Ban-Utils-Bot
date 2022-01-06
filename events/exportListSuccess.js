const { db } = require('../lib/firebase.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'exportListSuccess',
  async execute(client, user, url, guild) {
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
    console.log('logWebHookID: ', serverData.logWebhookID);
    const webhookID = serverData.logWebhookID;
    try {
      if (webhookID) {
        const webhookClient = await client.fetchWebhook(webhookID);
        const logEmb = new MessageEmbed()
          .setColor('#D8D4D3')
          .setTitle('**Export Log**')
          .setDescription('Ban List was just exported!')
          .addFields(
            { name: '**Export Requested by**', value: user.tag },
            { name: '**URL**', value: url },
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
