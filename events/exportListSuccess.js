// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction } = require('discord.js');
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
   * @param {string} exportOptions.url - url of exported list
   * @param {boolean} exportOptions.advanceMode - whether list was in advanced mode
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { url, advanceMode }) {
    const exportLog = new MessageEmbed()
      .setColor(EMBCOLORS.whiteGray)
      .setTitle('**BU Export Log**')
      .setDescription(`Ban list of this server was just exported!\nExport Requested by ${interaction.user}\nAdvanced mode: **\`${advanceMode}\`**`)
      .addFields([
        {
          name: '**URL**',
          value: url
        }
      ])
      .setTimestamp();

    await sendHook(interaction.client, exportLog, interaction.guild)
      .then(() => console.log('BU Export Log sent!'))
      .catch((error) => {
        console.log('BU Export Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
