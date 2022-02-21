// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');
module.exports = {
  name: 'userBanned',

  /**
   * send log when user is banned via bot
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   * @param {Object} BUBanOptions
   * @param {string} BUBanOptions.reason
   * @param {number} BUBanOptions.daysOfMsgs
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { reason, daysOfMsgs }) {
    const bannedUser = interaction.options.getUser('user'),
      embedBanLog = new MessageEmbed()
        .setTitle('**BU Ban Log**')
        .setColor(EMBCOLORS.hammerHandle)
        .setDescription(`\`${bannedUser.tag}\` ${bannedUser} got hit with the swift hammer of justice!\nID: \`${bannedUser.id}\`\nDays of messages deleted: ${daysOfMsgs}`)
        .setThumbnail(bannedUser.displayAvatarURL({ dynamic: true }))
        .addFields([
          {
            name: '**Justice Ban Hammer Wielder**',
            value: `${interaction.user.tag} ${interaction.user}`
          },
          {
            name: '**Ban Reason**',
            value: `${reason}`
          }
        ])
        .setTimestamp();

    await sendHook(interaction.client, embedBanLog, interaction.guild)
      .then(() => console.log('BU Ban Log sent!'))
      .catch((error) => {
        console.log('BU Ban Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
