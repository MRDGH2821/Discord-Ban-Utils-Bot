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
let bans;
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
		const ichannel = interaction.channel;
		const iguildId = interaction.guildId;
		const serverName = interaction.guild.name;
		await interaction.reply('Parsing...');
		paste.get(paste_id, function(success, data) {
			try {
				bans = JSON.parse(data);
			}
			catch (e) {
				return ichannel.send('Input argument is not a JSON array or valid file path.');
			}
			// return interaction.followUp(data);

		});
		for (const v of bans) {
			console.log(`Banning user ID ${v}...`);
			await rest.put(
				Routes.guildBan(iguildId, v),
				{ reason: `Ban Import on ${date}` },
			);
		}
		return ichannel.send(`Successfully imported ${bans.length} bans for guild ${serverName}.`);

	},
};
