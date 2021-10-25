const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true)),

	async execute(interaction) {

		const target = interaction.options.getUser('user');

		if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
			interaction.guild.members.unban(target);
			await interaction.reply({ content: `User \`${target.tag}\` is unbanned from this server.` });
		}

		else {
			await interaction.reply('You cannot unban...');
		}
	},
};
