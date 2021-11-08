const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, pasteUser, pastePass, pasteKey } = require('../betaconfig.json');

const paste = require('better-pastebin');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();

paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-ban-list')
		.setDescription('Exports ban list of current server')
		.addStringOption(option =>
			option.setName('expiry')
				.setDescription('Set expiry of the generated pastebin. (Default: 1 Day)')
				.addChoice('Never', 'N')
				.addChoice('10 Minutes', '10M')
				.addChoice('1 hour', '1H')
				.addChoice('1 Day', '1D')
				.addChoice('1 Week', '1W')
				.addChoice('2 Weeks', '2W')
				.addChoice('1 Month', '1M'),
		),

	async execute(interaction) {
		let expiry = interaction.options.getString('expiry');

		// If nothing is selected from the options, set default expiry as 1 Day
		if (expiry === null) {
			expiry = '1D';
		}

		// Fetch bans
		const bans = await rest.get(
			Routes.guildBans(interaction.guildId),
		);
		await interaction.deferReply(`Found ${bans.length} bans. Exporting...`);
		console.log(`Found ${bans.length} bans. Exporting...`);

		// Export bans
		let results = [];
		bans.forEach((v) => {
			results.push(v.user.id);
		});
		results = JSON.stringify(results);
		// console.log(results);

		// Send bans to pastebin
		const outputFile = `${interaction.guild.name}-${date}.txt`;
		paste.create({
			contents: results,
			name: outputFile,
			expires: expiry,
			anonymous: 'true',
		},
		function(success, data) {
			if (success) {
				// Returns the pastebin link
				return interaction.editReply(data);
			}
			else {
				// Incase of any errors
				return interaction.editReply('There was some unexpected error.');
			}
		});
	},
};
