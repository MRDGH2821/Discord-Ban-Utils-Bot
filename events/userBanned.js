const { db } = require('../lib/firebase.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'userBanned',
  async execute(client, mod, bannedUser, reason, guild) {
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
		logChannelID: <channel ID>,
		logWebhookID: <webhook ID>,
		serverID: <server ID>
  	}
		*/
    console.log('logWebHookID: ', serverData.logWebhookID);
    const webhookID = serverData.logWebhookID;
    try {
      if (webhookID) {
        const webhookClient = await client.fetchWebhook(webhookID);
        const logEmb = new MessageEmbed()
          .setColor('#e1870a')
          .setTitle('**Ban Log**')
          .setDescription('A person got hit with the swift hammer of justice!')
          .addFields(
            {
              name: '**Moderator who wielded the mighty hammer of justice**',
              value: mod.tag,
            },
            {
              name: '**Justice Hammer Target**',
              value: `${bannedUser.tag} ${bannedUser}`,
            },
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
