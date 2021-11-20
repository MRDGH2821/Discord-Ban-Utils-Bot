const { Permissions } = require('discord.js');
function MutualBannableServers(interaction) {
	const guilds = [];
	for (const [, guild] of interaction.client.guilds.cache) {
		try {
			const member = guild.members.fetch({
				user: interaction.user,
				force: true,
			});
			if (member) {
				if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
					guilds.push(guild);
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	}
	return guilds;
}
function MutualServers(interaction) {
	const guilds = [];
	for (const [, guild] of interaction.client.guilds.cache) {
		try {
			const member = guild.members.fetch({
				user: interaction.user,
				force: true,
			});
			if (member) {
				guilds.push(guild);
			}
		}
		catch (e) {
			console.log(e);
		}
	}
	return guilds;
}
module.exports = {
	MutualBannableServers,
	MutualServers,
};
