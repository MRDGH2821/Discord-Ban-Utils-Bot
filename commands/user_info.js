const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user_info')
		.setDescription('Display info about yourself.'),
	async execute(interaction) {
		const userInfo = new MessageEmbed()
			.setColor(0xd8d4d3)
			.setTitle('User info')
			.setDescription('Displays user information & permissions.')
			.addFields(
				{
					name: 'Username',
					value: `${interaction.user.tag}`,
				},
				{
					name: 'User ID (a.k.a. Snowflake value)',
					value: `${interaction.user.id}`,
				},
			);
		try {
			if (interaction.guild) {
				let canBan, canKick;
				if (
					interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
				) {
					canBan = true;
				}
				else {
					canBan = false;
				}
				if (
					interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])
				) {
					canKick = true;
				}
				else {
					canKick = false;
				}
				// embed showing details
				userInfo.addFields(
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
				);
				return interaction.reply({ embeds: [userInfo] });
			}
			else {
				userInfo.setFooter(
					'User this command in a server to know more details!',
				);
				await interaction.reply({
					embeds: [userInfo],
					components: [InviteRow],
				});
			}
		}
		catch (e) {
			await interaction.reply({
				content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
				components: [SupportRow],
			});
		}
	},
};
