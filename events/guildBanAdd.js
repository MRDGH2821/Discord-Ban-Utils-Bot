// eslint-disable-next-line no-unused-vars
const { MessageEmbed, GuildBan } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'guildBanAdd',

  /**
   * send log on new banned user
   * @async
   * @function execute
   * @param {GuildBan} guildBan - guild ban object
   */
  // eslint-disable-next-line sort-keys
  async execute(guildBan) {
    // console.log(guildBan);
    if (guildBan.user.id !== guildBan.client.user.id) {
      const banLog = new MessageEmbed()
          .setColor(EMBCOLORS.hammerHandle)
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
        const payload = {
          embeds: [banLog]
        };
        await sendHook(guildBan.client, payload, guildBan.guild)
          .then(() => console.log('Audit Ban Log sent!'))
          .catch((error) => {
            console.log('Audit Ban Log not sent due to error.\nError dump:');
            console.error(error);
          });
      }
    }
  }
};
