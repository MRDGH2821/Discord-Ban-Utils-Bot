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
   * @param {Interaction} interaction - interaction object
   * @param {Object} importOptions - import options object
   * @param {@link} importOptions.url - url to import from
   * @param {string} importOptions.reason - reason specified for ban list
   * @param {boolean} importOptions.advanceMode - whether ban list was in advanced mode or not
   * @param {number} importOptions.uniqueBans - number of non-duplicate bans
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
        .setTimestamp(),
      payload = {
        embeds: [importLog]
      };
    await sendHook(interaction.client, payload, interaction.guild)
      .then(() => console.log('BU Import Log sent!'))
      .catch((error) => {
        console.log('BU Import Log not sent due to error.\nError dump:');
        console.error(error);
      });
  }
};
