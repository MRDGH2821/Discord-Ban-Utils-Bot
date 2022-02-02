const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'guildBanAdd',
  // eslint-disable-next-line sort-keys
  async execute(ban) {
    const embed = {
        color: 0xe1870a,
        title: '**User banned!**',
        // eslint-disable-next-line sort-keys
        thumbnail: { url: ban.user.displayAvatarURL({ dynamic: true }) },
        // eslint-disable-next-line sort-keys
        fields: [
          {
            name: '**Reason**',
            value: `${ban.reason}`
          }
        ],
        footer: { text: `ID: ${ban.user.id}` },
        timestamp: new Date()
      },
      fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD'
      }),
      // Since there's only 1 audit log entry in this collection, grab the first one
      firstBanLog = fetchedLogs.entries.first(),

      /*
       * Now grab the user object of the person who banned the member
       * Also grab the target of this action to double-check things
       */
      { executor, target } = firstBanLog;

    // Perform a coherence check to make sure that there's *something*
    if (!firstBanLog) {
      const line = `${ban.user.tag} ${ban.user} was banned from ${ban.guild.name}.`;
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: 'No audit log could be found.'
      });
      console.log(line, 'No audit log could be found.');
    }

    /*
     * Update the output with a bit more information
     * Also run a check to make sure that the log returned was for the same banned member
     */
    if (target.id === ban.user.id) {
      const line = `${ban.user.tag} ${ban.user} got hit with the swift hammer of justice in the guild ${ban.guild.name}!`;
      console.log(line, 'Justice Hammer Wielder: ', executor.tag);
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: `${executor.tag} ${executor}`
      });
    }
    else {
      const line = `${ban.user.tag} ${ban.user} got hit with the swift hammer of justice in the guild ${ban.guild.name}!`;
      console.log(line, 'Audit log fetch was inconclusive.');
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: 'Audit log fetch was inconclusive.'
      });
    }

    // eslint-disable-next-line one-var
    const serverDB = await db.collection('servers').doc(ban.guild.id)
      .get();

    try {
      const isBannedViaCmd = ban.client.user.id === executor.id;
      console.log('Ban.client: ', ban.client.user.id);
      console.log('Executor: ', executor.id);
      if (!isBannedViaCmd) {
        if (serverDB.exists) {
          const serverData = serverDB.data(),
            webhookID = serverData.logWebhookID;
          console.log('Doc data: ', serverData);
          console.log('logWebHookID: ', serverData.logWebhookID);

          if (webhookID) {
            const webhookClient = await ban.guild.client.fetchWebhook(webhookID);
            webhookClient.send({
              embeds: [embed]
            });
          }
        }
        else {
          console.log(`No log channel configured for ${ban.guild.name}`);
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }
};
