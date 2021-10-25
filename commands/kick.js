const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Enter reason for Kick. Will be sent as DM to user'),
		),

	async execute(interaction) {

		const target = interaction.options.getMember('user');
		const reason = interaction.options.getString('reason');

		if (interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) {
			// Checks if target user can be kicked or not
			if (target.kickable) {
				// If there is a reason specified, DM it to the user.
				if (reason) {
					try {
						await target.user.send(`Reason for kicking from ${interaction.guild.name}: ${reason}`);
					}
					catch (e) {
						console.log('Reason cannot be DM-ed');
					}
				}
				await interaction.reply({ content: `User \`${target.user.tag}\` is kicked from this server.` });
				await target.kick();
			}
			// If user cannot be kicked
			else {
				await await interaction.reply({ content: `User \`${target.user.tag}\` cannot be kicked :grimacing:.` });
			}
		}
		// If you don't have permissions to kick
		else {
			await interaction.reply('You cannot kick...');
		}
	},
};
