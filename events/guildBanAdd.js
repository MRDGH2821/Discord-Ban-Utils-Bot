const { db } = require('../lib/firebase.js');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    //	const bannedUser = await ban.user.fetch();
    //	console.log(bannedUser);
    //	console.log('A member is banned');
    //	console.log(ban);
    const embed = {
      color: 0xe1870a,
      title: '**User banned!**',
      fields: [],
      footer: { text: `ID: ${ban.user.id}` },
      timestamp: new Date(),
    };

    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_BAN_ADD',
    });
    // Since there's only 1 audit log entry in this collection, grab the first one
    const banLog = fetchedLogs.entries.first();

    // Perform a coherence check to make sure that there's *something*
    if (!banLog) {
      const line = `${ban.user.tag} ${ban.user} was banned from ${ban.guild.name}.`;
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: 'No audit log could be found.',
      });
      console.log(line, 'No audit log could be found.');
    }

    // Now grab the user object of the person who banned the member
    // Also grab the target of this action to double-check things
    const { executor, target } = banLog;

    // Update the output with a bit more information
    // Also run a check to make sure that the log returned was for the same banned member
    if (target.id === ban.user.id) {
      const line = `${ban.user.tag} ${ban.user} got hit with the swift hammer of justice in the guild ${ban.guild.name}!`;
      console.log(line, 'Justice Hammer Wielder: ', executor.tag);
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: `${executor.tag} ${executor}`,
      });
    }
    else {
      const line = `${ban.user.tag} ${ban.user} got hit with the swift hammer of justice in the guild ${ban.guild.name}!`;
      console.log(line, 'Audit log fetch was inconclusive.');
      embed.description = line;
      embed.fields.push({
        name: '**Justice Hammer Wielder**',
        value: 'Audit log fetch was inconclusive.',
      });
    }

    const serverDB = await db
      .collection('servers')
      .doc(ban.guild.id)
      .get();

    try {
      if (serverDB.exists) {
        const serverData = serverDB.data();
        console.log('Doc data: ', serverData);
        console.log('logWebHookID: ', serverData.logWebhookID);
        const webhookID = serverData.logWebhookID;

        if (webhookID) {
          const webhookClient = await ban.guild.client.fetchWebhook(webhookID);
          webhookClient.send({
            embeds: [embed],
          });
        }
      }
      else {
        console.log(`No log channel configured for ${ban.guild.name}`);
      }
    }
    catch (error) {
      console.log(error);
    }
  },
};
