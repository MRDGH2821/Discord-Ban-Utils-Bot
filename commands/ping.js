// eslint-disable-next-line no-unused-vars
const { MessageEmbed, CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EMBCOLORS } = require('../lib/Constants.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency!'),

  note: 'Shows ping results of both, complete round trip & Discord API responsiveness',

  /**
   * display bot latency & websocket latency
   * @async
   * @function execute
   * @param {CommandInteraction} interaction
   */
  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    const sent = await interaction.reply({
        content: 'Pinging...',
        fetchReply: true
      }),
      sentEmb = new MessageEmbed()
        .setTitle('**Ping Results**')
        .setColor(EMBCOLORS.whiteGray)
        .addFields([
          {
            name: '**Round Trip Latency**',
            value: `\`${
              sent.createdTimestamp - interaction.createdTimestamp
            }\` ms\n\nThis describes the amount of time taken from creation of command message to the creation of the response message.\nThis is more relevant to end user.`
          },
          {
            name: '**Websocket Heartbeat**',
            value: `\`${interaction.client.ws.ping}\` ms\n\nIt is the average interval of a regularly sent signal indicating the healthy operation of Discord API`
          }
        ])
        .setTimestamp();
    await interaction.editReply({
      content: 'Ping Results',
      embeds: [sentEmb]
    });
  }
};
