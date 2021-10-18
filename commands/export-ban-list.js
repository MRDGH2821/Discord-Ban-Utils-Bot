const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, pasteUser, pastePass, pasteKey } = require('../config.json');

const paste = require('better-pastebin');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();

paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-ban-list')
		.setDescription('Exports ban list of current server'),

	async execute(interaction) {
		const bans = await rest.get(
			Routes.guildBans(interaction.guildId),
		);
		await interaction.deferReply(`Found ${bans.length} bans. Exporting...`);
		console.log(`Found ${bans.length} bans. Exporting...`);

		let results = [];
		bans.forEach((v) => {
			results.push(v.user.id);
		});
		results = JSON.stringify(results);
		console.log(results);

		const outputFile = `${interaction.guild.name}-${date}.txt`;
		paste.create({
			contents: results,
			name: outputFile,
			expires: '1D',
			anonymous: 'true',
		},
		function(success, data) {
			if (success) {
				return interaction.editReply(data);
			}
			else {
				return interaction.editReply('There was some unexpected error.');
			}
		});
	},
};
