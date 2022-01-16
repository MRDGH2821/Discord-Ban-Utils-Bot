const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'userBanned',
  async execute(interaction, bannedUser, reason, daysOfMsgs) {
    /*
		console.log('Moderator: ', mod);
		console.log('Banned user: ', bannedUser);
		console.log('Reason: ', reason);
		console.log('Guild: ', guild);
    */

    const serverDB = await db
      .collection('servers')
      .doc(`${interaction.guild.id}`)
      .get();

    try {
      if (serverDB.exists) {
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

        if (webhookID) {
          const webhookClient = await interaction.client.fetchWebhook(
            webhookID,
          );
          const logEmb = {
            color: 0xe1870a,
            title: '**Ban Log**',
            description: 'A person got hit with the swift Hammer of Justice!',
            thumbnail: {
              url: bannedUser.displayAvatarURL(),
            },
            fields: [
              {
                name: '**Justice Hammer Wielder**',
                value: `${interaction.user}`,
              },
              {
                name: '**Justice Hammer Target**',
                value: `${bannedUser.tag} ${bannedUser}\nID: ${bannedUser.id}`,
              },
              {
                name: '**Reason**',
                value: `${reason}`,
              },
              {
                name: '**Days of messages deleted**',
                value: `${daysOfMsgs}`,
              },
            ],
            timestamp: new Date(),
            footer: {
              text: bannedUser.id,
            },
          };
          webhookClient.send({
            embeds: [logEmb],
          });
        }
      }
      else {
        console.log(`No log channel configured for ${interaction.guild.name}`);
      }
    }
    catch (error) {
      console.log(error);
    }
  },
};
