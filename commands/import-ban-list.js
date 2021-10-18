const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, pasteUser, pastePass, pasteKey } = require('../config.json');

const paste = require('better-pastebin');
// const fs = require('fs');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();
console.log(date.toDateString());
paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);
let bans;
let blen = 0;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('import-ban-list')
		.setDescription('Imports ban list of current server')
		.addStringOption(option =>
			option.setName('pastebin_link')
				.setDescription('Enter full pastebin link')
				.setRequired(true)),

	async execute(interaction) {
		const paste_id = interaction.options.getString('pastebin_link');
		const iguildId = interaction.guildId;
		const serverName = interaction.guild.name;
		await interaction.reply('Parsing...');
		paste.get(paste_id, function(success, data) {

			/*
			console.log('IMPORT SUCESS');
			console.log(data);
			console.log(typeof data);
			console.log(typeof data[0]);
*/
			if (success) {
				bans = JSON.parse(data);
				blen = bans.length;
				/*
			console.log('\n\n\n\n');
			console.log(bans);
			console.log(typeof bans);
			console.log(typeof bans[0]);
*/
				// bans = data;

				bans.forEach((v) => {
					console.log(`Banning user ID ${v}...`);
					rest.put(
						Routes.guildBan(iguildId, v),
						{ reason: `Ban Import on ${date.toDateString()}` },
					);
				});
				return interaction.editReply(`Successfully imported ${blen} bans for guild ${serverName}.`);

			}
			else {
				return interaction.editReply('Given PasteBin link does not have contents in proper format...');
			}

			// return interaction.followUp(data);

		});


	},
};
