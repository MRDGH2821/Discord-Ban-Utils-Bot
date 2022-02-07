const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'exportListSuccess',
  // eslint-disable-next-line sort-keys
  async execute(interaction, url, advanceMode) {
    const serverDB = await db
      .collection('servers')
      .doc(`${interaction.guild.id}`)
      .get();
    try {
      if (serverDB.exists) {
        const serverData = serverDB.data(),
          webhookID = serverData.logWebhookID;
        console.log('Doc data: ', serverData);

        /* serverData format:
           {
           logChannel: <channel ID>,
           logWebhook: <webhook ID>,
           serverID: <server ID>
           } */
        console.log('logWebHookID: ', serverData.logWebhookID);

        if (webhookID) {
          const webhookClient = await interaction.client.fetchWebhook(webhookID),
            // eslint-disable-next-line sort-vars
            logEmb = {
              color: 0xd8d4d3,
              title: '**Export Log**',
              // eslint-disable-next-line sort-keys
              description: 'Ban List was just exported!',
              fields: [
                {
                  name: '**Export Requested by**',
                  value: `${interaction.user}`
                },
                { name: '**URL**',
                  value: url },
                {
                  name: '**Advanced mode?**',
                  value: `${advanceMode}`
                }
              ],
              timestamp: new Date()
            };
          webhookClient.send({
            embeds: [logEmb]
          });
        }
      }
      else {
        console.log(`No log channel configured for ${interaction.guild.name} `);
      }
    }
    catch (error) {
      console.log(error);
    }
  }
};
