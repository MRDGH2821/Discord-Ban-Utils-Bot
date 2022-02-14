const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency!'),

  note: 'Shows ping results of both, complete round trip & Discord API responsiveness',

  // eslint-disable-next-line sort-keys
  async execute(interaction) {
    const sent = await interaction.reply({
        content: 'Pinging...',
        fetchReply: true
      }),
      sentEmb = new MessageEmbed()
        .setTitle('**Ping Results**')
        .setColor('d8d4d3')
        .addFields([
          {
            name: '**Round Trip Latency**',
            value: `${
              sent.createdTimestamp - interaction.createdTimestamp
            } ms\nThis describes the amount of time taken from creation of command message to the creation of the response message.\nThis is more relevant to end user.`
          },
          {
            name: '**Websocket Heartbeat**',
            value: `${interaction.client.ws.ping} ms\nIt is the average interval of a regularly sent signal indicating the healthy operation of the websocket connection. This is where the bot recieves events (for eg. command execution event)`
          }
        ]);
    await interaction.editReply({
      content: 'Ping Results',
      embeds: [sentEmb]
    });
  }
};
