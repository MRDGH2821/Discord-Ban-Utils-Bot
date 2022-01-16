const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'guildBanRemove',
  async execute(member) {
    const serverDB = await db
      .collection('servers')
      .doc(`${member.guild.id}`)
      .get();
    try {
      if (serverDB.exists) {
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

        if (webhookID) {
          const webhookClient = await member.client.fetchWebhook(webhookID);
          const logEmb = {
            color: 0xd8d4d3,
            title: '**Unban Log**',
            description: `${member.user.tag} ${member.user} is unbanned from the server`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
            timestamp: new Date(),
            footer: {
              text: `${member.user.id}`,
            },
          };
          webhookClient.send({
            embeds: [logEmb],
          });
        }
      }
      else {
        console.log(`No log channel configured for ${member.guild.name} `);
      }
    }
    catch (e) {
      console.log(e);
    }
  },
};
