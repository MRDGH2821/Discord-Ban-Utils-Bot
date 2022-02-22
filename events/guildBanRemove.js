// eslint-disable-next-line no-unused-vars
const { MessageEmbed, GuildBan } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'guildBanRemove',

  /**
   * send log on new unbanned user
   * @async
   * @function execute
   * @param {GuildBan} member - guild ban object
   */
  // eslint-disable-next-line sort-keys
  async execute(member) {
    const unbanLog = new MessageEmbed()
      .setTitle('**Audit Unban Log**')
      .setColor(EMBCOLORS.whiteGray)
      .setDescription(`${member.user.tag} ${member.user} is unbanned from the server\nID: \`${member.user.id}\``)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await sendHook(member.client, unbanLog, member.guild)
      .then(() => console.log('Audit Un-Ban Log sent!'))
      .catch((error) => {
        console.log('Audit Un-Ban Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
