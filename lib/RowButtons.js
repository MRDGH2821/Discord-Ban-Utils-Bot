const { MessageActionRow, MessageButton } = require('discord.js'),
  InviteRow = new MessageActionRow().addComponents(new MessageButton()
    .setLabel('Invite the Bot in your server!')
    .setStyle('LINK')
    .setURL('https://discord.com/api/oauth2/authorize?client_id=897454611370213436&permissions=1377073941638&scope=bot%20applications.commands')),
  SupportRow = new MessageActionRow()
    .addComponents(new MessageButton()
      .setLabel('Join Support Server')
      .setStyle('LINK')
      .setURL('https://discord.gg/MPtE9zsBs5'))
    .addComponents(new MessageButton()
      .setLabel('Report an Issue at GitHub')
      .setStyle('LINK')
      .setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues'));

module.exports = {
  InviteRow,
  SupportRow
};
