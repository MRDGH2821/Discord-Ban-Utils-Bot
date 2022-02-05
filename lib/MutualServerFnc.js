const { Permissions } = require('discord.js');
function MutualBannableServers(interaction) {
  const guilds = [];
  for (const [, guild] of interaction.client.guilds.cache) {
    try {
      const member = guild.members.fetch({
        force: true,
        user: interaction.user
      });
      if (member) {
        if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
          guilds.push(guild);
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  return guilds;
}
function MutualServers(interaction) {
  const guilds = [];
  for (const [, guild] of interaction.client.guilds.cache) {
    try {
      const member = guild.members.fetch({
        force: true,
        user: interaction.user
      });
      if (member) {
        guilds.push(guild);
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  return guilds;
}
module.exports = {
  MutualBannableServers,
  MutualServers
};
