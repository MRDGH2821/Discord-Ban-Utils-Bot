const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'guildBanRemove',
  // eslint-disable-next-line sort-keys
  async execute(member) {
    const serverDB = await db
      .collection('servers')
      .doc(`${member.guild.id}`)
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
          const webhookClient = await member.client.fetchWebhook(webhookID),
            // eslint-disable-next-line sort-vars
            logEmb = {
              color: 0xd8d4d3,
              title: '**Unban Log**',
              // eslint-disable-next-line sort-keys
              description: `${member.user.tag} ${member.user} is unbanned from the server`,
              thumbnail: {
                url: member.user.displayAvatarURL({ dynamic: true })
              },
              timestamp: new Date(),
              // eslint-disable-next-line sort-keys
              footer: {
                text: `${member.user.id}`
              }
            };
          webhookClient.send({
            embeds: [logEmb]
          });
        }
      }
      else {
        console.log(`No log channel configured for ${member.guild.name} `);
      }
    }
    catch (error) {
      console.log(error);
    }
  }
};
