// eslint-disable-next-line no-unused-vars
const { Interaction, Guild, MessageEmbed } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'banTransfer',

  /**
   * send ban transfer log on both servers
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} transferInfo
   * @param {number} transferInfo.banDest
   * @param {number} transferInfo.banSource
   * @param {number} transferInfo.bansTransferred
   * @param {Guild} transferInfo.destGuild
   */
  // eslint-disable-next-line sort-keys
  async execute(
    interaction,
    { banDest, banSource, bansTransferred, destGuild }
  ) {
    const transfer_log = new MessageEmbed()
      .setTitle('**BU Ban Transfer Log**')
      .setColor(EMBCOLORS.whiteGray)
      .setDescription(`Source server: ${interaction.guild.name}\nDestination server: ${destGuild.name}`)
      .addFields([
        {
          name: '**Transfer initiated by**',
          value: `${interaction.user.tag} ${interaction.user}`
        },
        {
          name: '**Transfer Statistics**',
          value: `Bans in source: **\`${banSource}\`**\nBans in destination:**\`${banDest}\`**\nUnique Bans: **\`${bansTransferred}\`**`
        }
      ]);
    await sendHook(interaction.client, transfer_log, interaction.guild)
      .then(() => console.log('BU Ban Transfer Log sent!'))
      .catch((error) => {
        console.log('BU Ban Transfer Log not sent due to error.\nError dump:');
        console.error(error);
      });
    await sendHook(interaction.client, transfer_log, destGuild)
      .then(() => console.log('BU Ban Transfer Log sent!'))
      .catch((error) => {
        console.log('BU Ban Transfer Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
