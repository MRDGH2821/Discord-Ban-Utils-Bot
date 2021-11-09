const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('user_info')
		.setDescription('Display info about yourself.'),
	async execute(interaction) {
		let canBan, canKick;
		if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
			canBan = true;
		}
		else {
			canBan = false;
		}
		if (interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) {
			canKick = true;
		}
		else {
			canKick = false;
		}
		// embed showing details
		const userInfo = {
			color: 0xd8d4d3,
			title: 'User info',
			description:
        'Displays whether you have sufficient permissions to kick or ban or not.',
			fields: [
				{
					name: 'Username',
					value: `${interaction.user.tag}`,
				},
				{
					name: 'User ID (a.k.a. Snowflake value)',
					value: `${interaction.user.id}`,
				},
				{
					name: 'Server Name',
					value: `${interaction.guild.name}`,
				},
				{
					name: 'Server ID (a.k.a. Snowflake value)',
					value: `${interaction.guild.id}`,
				},
				{
					name: 'Can you kick?',
					value: `${canKick}`,
				},
				{
					name: 'Can you ban?',
					value: `${canBan}`,
				},
			],
		};
		return interaction.reply({ embeds: [userInfo] });
	},
};
