const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, pasteUser, pastePass, pasteKey } = require('../config.json');

const paste = require('better-pastebin');
// const fs = require('fs');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();
paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export-ban-list')
		.setDescription('Exports ban list of current server'),

	async execute(interaction) {
		const timeString = time(date);
		const outputFile = `../temp/${interaction.guild.name}-${timeString}.txt`;

		const bans = await rest.get(
			Routes.guildBans(interaction.guildId),
		);

		await interaction.reply(`Found ${bans.length} bans. Exporting...`);

		let results = [];
		// const reasons = [];

		bans.forEach((v) => {
			results.push(v.user.id);
			// , v.reason
		});

		results = JSON.stringify(results);
		//	reasons = JSON.stringify(reasons);

		//	fs.writeFile(outputFile, results);
		await interaction.followUp(results);
	//	await interaction.channel.send({ files:[outputFile] });
	//	fs.unlink(outputFile);
	},
};
