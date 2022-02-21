// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Interaction } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { sendHook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'importListSuccess',

  /**
   * send log after successful import of ban list
   * @async
   * @function execute
   * @param {Interaction} interaction
   * @param {Object} importOptions
   * @param {@link} importOptions.url
   * @param {string} importOptions.reason
   * @param {boolean} importOptions.advanceMode
   * @param {number} importOptions.uniqueBans
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction, { url, reason, advanceMode, uniqueBans }) {
    const importLog = new MessageEmbed()
      .setTitle('**BU Import Log**')
      .setColor(EMBCOLORS.hammerHandle)
      .setDescription(`Ban list of this server was just imported!\nImported by \`${interaction.user.tag}\` ${interaction.user}\nAdvanced mode: **\`${advanceMode}\`**\nUnique Bans: ${uniqueBans}`)
      .addFields([
        {
          name: '**URL**',
          value: url
        },
        {
          name: '**Reason**',
          value: `${reason}`
        }
      ])
      .setTimestamp();

    await sendHook(interaction.client, importLog, interaction.guild)
      .then(() => console.log('Audit Ban Log sent!'))
      .catch((error) => {
        console.log('Audit Ban Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
