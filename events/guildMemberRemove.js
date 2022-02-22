// eslint-disable-next-line no-unused-vars
const { MessageEmbed, GuildMember } = require('discord.js');
const { time } = require('@discordjs/builders');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'guildMemberRemove',

  /**
   * send a log when member leaves server
   * @async
   * @function execute
   * @param {GuildMember} member - guild member object
   */
  // eslint-disable-next-line sort-keys
  async execute(member) {
    if (member.user.id !== member.client.user.id) {
      const exitLog = new MessageEmbed()
        .setTimestamp()
        .setTitle('**Audit Exit Log**')
        .setColor(EMBCOLORS.wrenchHandle)
        .setDescription(`${member.user.tag} ${member} left the server.\nID: \`${member.user.id}\``)
        .addFields([
          {
            name: '**Joined at**',
            value: time(member.joinedAt)
          }
        ]);

      await sendHook(member.client, exitLog, member.guild)
        .then(() => console.log('Audit Exit Log sent!'))
        .catch((error) => {
          console.log('Audit Exit Log not sent due to error.\nError dump:');
          console.error(error);
        });
    }
  }
};
