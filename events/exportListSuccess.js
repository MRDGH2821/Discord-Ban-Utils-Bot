// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction, MessageAttachment } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'exportListSuccess',

  /**
   * send log after successful export of ban list
   * @async
   * @function execute
   * @param {Interaction} interaction - interaction object
   * @param {Object} exportOptions - export options object
   * @param {MessageAttachment} exportOptions.files - urls of exported list
   * @param {boolean} exportOptions.advanceMode - whether list was in advanced mode
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { advanceMode, files }) {
    const exportLog = new MessageEmbed()
        .setColor(EMBCOLORS.whiteGray)
        .setTitle('**BU Export Log**')
        .setDescription(`Ban list of this server was just exported!\nExport Requested by ${interaction.user}\nAdvanced mode: **\`${advanceMode}\`**`)
        .setTimestamp(),
      payload = {
        embeds: [exportLog],
        files
      };
    await sendHook(interaction.client, payload, interaction.guild)
      .then(() => console.log('BU Export Log sent!'))
      .catch((error) => {
        console.log('BU Export Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
