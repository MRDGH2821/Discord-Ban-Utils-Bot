// eslint-disable-next-line no-unused-vars
const { Interaction } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  /**
   * interaction create event
   * @async
   * @function execute
   * @param {Interaction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
    if (interaction.component) {
      try {
        const component = require(`../component-collectors/${interaction.component.customId}`);
        console.log(component);
        await component.run(interaction);
      }
      catch (error) {
        console.error('Component not found. Handing over to command\'s component handler');
      }
    }
  }
};
