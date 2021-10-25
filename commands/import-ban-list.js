const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Permissions } = require('discord.js');
const { token, pasteUser, pastePass, pasteKey } = require('../config.json');

const paste = require('better-pastebin');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();
console.log(date.toDateString());
paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import-ban-list')
		.setDescription('Imports ban list of current server')
		.addStringOption(option =>
			option.setName('pastebin_link')
				.setDescription('Enter full pastebin link')
				.setRequired(true)),

	async execute(interaction) {
		if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS]))	{
			const paste_id = interaction.options.getString('pastebin_link');
			await interaction.reply('Parsing... (If it is taking long time, it means the link was invalid & bot crashed)');
			paste.get(paste_id, function(success, data) {
				if (success) {
					try {
						const bans = JSON.parse(data);
						console.log(bans);
						console.log(JSON.parse(data));
						interaction.editReply(`${bans.length} bans are being imported in background. Sit back and relax for a while!`);
						bans.forEach((v) => {
							console.log(`Banning user ID ${v}...`);
							rest.put(
								Routes.guildBan(interaction.guildId, v),
								{ reason: `Ban Import on ${date.toDateString()}` },
							);
						});
						interaction.editReply(`${bans.length} imported successfully!`);
					}
					catch (e) {
						interaction.editReply('Given PasteBin link does not have contents in proper format...');
					}
				}
				else {
					interaction.editReply('Given PasteBin link does not have contents in proper format...');
				}
			});
		}
		else {
			interaction.reply('You cannot just ban anybody by importing 🤷. Contact Server Moderators!');
		}
	},
};
