const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban-two-point-oh')
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

		//		interaction.guild.members.ban(target);
		await rest.put(
			Routes.guildBan(interaction.guildId, target.id),
			{ reason: reas },
		);
		if (reas === null) {
			await interaction.reply({ content: `User \`${target.tag}\` is banned from this server ||for no reason :joy:||.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `User \`${target.tag}\` is banned from this server. \nReason: \`${reas}\`.`, ephemeral: true });
		}
	},
};
