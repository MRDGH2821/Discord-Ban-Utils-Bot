const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const { Permissions } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Enter Reason. (Default: No reason Given)'),
		),

	async execute(interaction) {

		const target = interaction.options.getUser('user');
		const reas = interaction.options.getString('reason');

		if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
			await rest.put(
				Routes.guildBan(interaction.guildId, target.id),
				{ reason: reas },
			);
			if (reas === null) {
				await interaction.reply({ content: `User \`${target.tag}\` is banned from this server ||for no reason :joy:||.` });
			}
			else {
				await interaction.reply({ content: `User \`${target.tag}\` is banned from this server. \nReason: \`${reas}\`.` });
			}
		}
		else {
			await interaction.reply('You cannot ban...');
		}
	},
};
