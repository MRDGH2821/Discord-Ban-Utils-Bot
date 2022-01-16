const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'exportListSuccess',
  async execute(interaction, url) {
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
		logChannel: <channel ID>,
		logWebhook: <webhook ID>,
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
            color: 0xd8d4d3,
            title: '**Export Log**',
            description: 'Ban List was just exported!',
            fields: [
              { name: '**Export Requested by**', value: `${interaction.user}` },
              { name: '**URL**', value: url },
            ],
            timestamp: new Date(),
          };
          webhookClient.send({
            embeds: [logEmb],
          });
        }
      }
      else {
        console.log(`No log channel configured for ${interaction.guild.name} `);
      }
    }
    catch (e) {
      console.log(e);
    }
  },
};
