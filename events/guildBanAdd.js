const { MessageEmbed } = require('discord.js');
const { db } = require('../lib/firebase');

module.exports = {
  name: 'guildBanAdd',

  // eslint-disable-next-line sort-keys
  async execute(guildBan) {
    // console.log(guildBan);
    const banLog = new MessageEmbed()
        .setColor('e1870a')
        .setTitle('**Audit Ban Log**')
        .setThumbnail(guildBan.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`\`${guildBan.user.tag}\` ${guildBan.user} got hit with the swift hammer of justice!\nID: \`${guildBan.user.id}\``)
        .setTimestamp(),
      fetchedLogs = await guildBan.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD'
      }),
      // since there's only 1 audit log entry in this collection, grab the first one
      firstBanLog = fetchedLogs.entries.first(),
      { executor, reason, target } = firstBanLog,
      isBannedViaCmd = guildBan.client.user.id === executor.id;
    if (!firstBanLog) {
      banLog.addField([
        {
          name: '**Justice Ban Hammer Wielder**',
          value:
            'Unfortunately that could not be determined even from Audit logs'
        },
        {
          name: '**Ban Reason**',
          value: `${reason}`
        }
      ]);
      console.log('No audit log found');
    }

    if (target.id === guildBan.user.id) {
      banLog.addFields([
        {
          name: '**Justice Ban Hammer Wielder**',
          value: `${executor} ${executor.tag}`
        },
        {
          name: '**Ban Reason**',
          value: `${reason}`
        }
      ]);
    }
    else {
      banLog.addFields([
        {
          name: '**Justice Ban Hammer Wielder**',
          value: 'Audit log fetch was inconclusive.'
        },
        {
          name: '**Ban Reason**',
          value: `${reason}`
        }
      ]);
    }
    if (!isBannedViaCmd) {
      try {
        const loghook = await guildBan.client.webhooksCache.find((webhook) => webhook.guildId === guildBan.guild.id);

        loghook.send({ embeds: [banLog] });
        console.log('Webhook fetched from Cache');
      }
      catch (error) {
        const serverDB = await db
          .collection('servers')
          .doc(guildBan.guild.id)
          .get();

        if (serverDB.exists) {
          const serverData = serverDB.data(),
            serverWebhook = await guildBan.client.fetchWebhook(serverData.logWebhookID);

          serverWebhook.send({ embeds: [banLog] });
          console.log('Webhook fetched from API');
        }
        else {
          console.log(`Logs channel not set in ${guildBan.guild.name}`);
        }
        console.log('Error Dump:');
        console.error(error);
      }
    }
  }
};
