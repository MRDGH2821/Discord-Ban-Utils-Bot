// eslint-disable-next-line no-unused-vars
const { GuildMember, MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { sendHook } = require('../lib/UtilityFunctions.js');
const { EMBCOLORS } = require('../lib/Constants.js');

module.exports = {
  name: 'guildMemberUpdate',

  /**
   * send timeout log
   * @async
   * @function execute
   * @param {GuildMember} oldMember - old guild member object
   * @param {GuildMember} newMember - new guild member object
   */
  // eslint-disable-next-line sort-keys
  async execute(oldMember, newMember) {
    if (newMember.isCommunicationDisabled()) {
      const timeout_log = new MessageEmbed()
        .setTitle('**Audit Timeout Log**')
        .setColor(EMBCOLORS.freeze)
        .setDescription(`${newMember.user.tag} ${
          newMember.user
        } is put on timeout.\nTimeout duration: ${time(newMember.communicationDisabledUntil)} i.e. ${time(newMember.communicationDisabledUntil, 'R')}\nID: \`${
          newMember.user.id
        }\``)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await sendHook(newMember.client, timeout_log, newMember.guild)
        .then(() => console.log('Audit Timeout Log sent!'))
        .catch((error) => {
          console.log('Audit Timeout Log not sent due to error.\nError dump:');
          console.error(error);
        });
    }
  }
};
