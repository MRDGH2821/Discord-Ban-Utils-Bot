const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency!'),
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
            value: `${sent.createdTimestamp - interaction.createdTimestamp} ms`
          },
          {
            name: '**Websocket Heartbeat**',
            value: `${interaction.client.ws.ping} ms`
          }
        ]);
    await interaction.editReply({
      content: 'Ping Results',
      embeds: [sentEmb]
    });
  }
};
