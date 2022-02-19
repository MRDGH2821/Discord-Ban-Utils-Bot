// eslint-disable-next-line no-unused-vars
const { ButtonInteraction } = require('discord.js');

module.exports = {
  customId: 'massban_notworking',

  /**
   * reply with solution when mass ban command doesn't work as expected
   * @async
   * @function execute
   * @param {ButtonInteraction} interacted
   */
  async run(interacted) {
    await interacted.reply({
      content:
        'You may either upload the list of IDs into https://dpaste.com and use the import command OR follow this [video](https://youtu.be/gxAqukdjtM8)\n\nThis is one of the limitations of slash commands. Read more [here](<https://gist.github.com/MinnDevelopment/b883b078fdb69d0e568249cc8bf37fe9>) ',
      ephemeral: true
    });
  }
};
