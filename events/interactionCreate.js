module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		console.log(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`,
		);

		const banHammer = [
			'ban',
			'export_ban_list',
			'import_ban_list',
			'mass_ban',
			'transfer_bans',
		];
		const info = ['user_info', 'help'];
		if (banHammer.includes(interaction.commandName)) {
			interaction.client.user.setActivity('a ban hammer being dropped', {
				type: 'WATCHING',
			});
		}
		else if (info.includes(interaction.commandName)) {
			interaction.client.user.setActivity('to tech support requests', {
				type: 'LISTENING',
			});
		}
	},
};
