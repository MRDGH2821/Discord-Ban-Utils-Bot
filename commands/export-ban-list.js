const { SlashCommandBuilder } = require('@discordjs/builders');
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
		// const timeString = time(date);

		// `../temp/${interaction.guild.name}-${timeString}.txt`;
		const ichannel = interaction.channel;
		const iguildId = interaction.guildId;
		const serverName = interaction.guild.name;

		const bans = await rest.get(
			Routes.guildBans(iguildId),
		);

		await interaction.reply(`Found ${bans.length} bans. Exporting...`);
		const trips = Math.ceil(bans.length / 99);

		for (let trip = 0; trip < trips; trip++) {

			let results = [];
			// const reasons = [];
			let i = 0 + trip * 99;
			const len = 99 + trip * 99;
			for (; i < len;i++) {
				results.push(bans[i].user.id);
				// , v.reason
			}


			results = JSON.stringify(results);
			//	reasons = JSON.stringify(reasons);
			const outputFile = `${serverName}-${date}.txt`;
			paste.create({
				contents: results,
				name: outputFile,
				expires: '1D',
				anonymous: 'true',
			},
			function(success, data) {
				if (success) {
					return ichannel.send(`${results} \n\n ${data}`);
				}
				else {
					return ichannel.send('There was some unexpected error.');
				}
			});

			//	fs.writeFile(outputFile, results);

		//	await interaction.channel.send({ files:[outputFile] });
		//	fs.unlink(outputFile);
		}
	},
};
