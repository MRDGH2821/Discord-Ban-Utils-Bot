const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'importListSuccess',
  // eslint-disable-next-line sort-keys
  async execute(interaction, url, reason, advMode) {
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
              title: '**Import Log**',
              // eslint-disable-next-line sort-keys
              description: 'Ban List was just imported!',
              fields: [
                { name: '**Imported by**', value: `${interaction.user}` },
                { name: '**URL**', value: url },
                {
                  name: '**Advance mode?**',
                  value: `${advMode}`
                },
                { name: '**Reason**', value: reason }
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
