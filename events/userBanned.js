module.exports = {
	name: 'userBanned',
	async execute(moderator, bannedUser, reason, guild) {
		console.log('Moderator: ', moderator);
		console.log('Banned user: ', bannedUser);
		console.log('Reason: ', reason);
		console.log('Guild: ', guild);
	},
};
