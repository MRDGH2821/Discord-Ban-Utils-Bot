const { MessageActionRow, MessageButton } = require('discord.js');
const { link } = require('./InviteLink.json');

const SupportRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setLabel('Join Support Server')
      .setStyle('LINK')
      .setURL('https://discord.gg/MPtE9zsBs5'),
  )
  .addComponents(
    new MessageButton()
      .setLabel('Report an Issue at GitHub')
      .setStyle('LINK')
      .setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues'),
  );

const InviteRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel('Invite the Bot in your server!')
    .setStyle('LINK')
    .setURL(link),
);

module.exports = {
  SupportRow,
  InviteRow,
};
