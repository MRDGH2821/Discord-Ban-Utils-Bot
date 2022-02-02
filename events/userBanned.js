const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'userBanned',
  // eslint-disable-next-line sort-keys
  async execute(interaction, reason, daysOfMsgs) {
    const bannedUser = await interaction.options.getUser('user'),
      serverDB = await db
        .collection('servers')
        .doc(`${interaction.guild.id}`)
        .get();

    /*
     *Console.log('Moderator: ', mod);
     *console.log('Banned user: ', bannedUser);
     *console.log('Reason: ', reason);
     *console.log('Guild: ', guild);
     */
    try {
      if (serverDB.exists) {
        const serverData = serverDB.data(),
          webhookID = serverData.logWebhookID;
        console.log('Doc data: ', serverData);

        /*
         * ServerData format:
         * {
         * logChannelID: <channel ID>,
         * logWebhookID: <webhook ID>,
         * serverID: <server ID>
         * }
         */
        console.log('logWebHookID: ', serverData.logWebhookID);

        if (webhookID) {
          const webhookClient = await interaction.client.fetchWebhook(webhookID),
            // eslint-disable-next-line sort-vars
            logEmb = {
              color: 0xe1870a,
              title: '**Ban Log**',
              // eslint-disable-next-line sort-keys
              description: 'A person got hit with the swift Hammer of Justice!',
              thumbnail: {
                url: bannedUser.displayAvatarURL()
              },
              // eslint-disable-next-line sort-keys
              fields: [
                {
                  name: '**Justice Hammer Wielder**',
                  value: `${interaction.user}`
                },
                {
                  name: '**Justice Hammer Target**',
                  value: `${bannedUser.tag} ${bannedUser}\nID: ${bannedUser.id}`
                },
                {
                  name: '**Reason**',
                  value: `${reason}`
                },
                {
                  name: '**Days of messages deleted**',
                  value: `${daysOfMsgs}`
                }
              ],
              timestamp: new Date(),
              // eslint-disable-next-line sort-keys
              footer: {
                text: bannedUser.id
              }
            };
          webhookClient.send({
            embeds: [logEmb]
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
  }
};
