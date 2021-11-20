const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Permissions } = require('discord.js');
const { token } = require('../betaconfig.json');
const { PasteCheck } = require('../lib/PasteBinFnc.js');
const dpst = require('dpaste-ts');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();
console.log(date.toDateString());

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import_ban_list')
		.setDescription('Imports ban list of current server')
		.addStringOption(option =>
			option
				.setName('pastebin_link')
				.setDescription('Enter full pastebin link')
				.setRequired(true),
		),

	async execute(interaction) {
		const paste_id = interaction.options.getString('pastebin_link');
		if (interaction.guild) {
			// User should have ban permissions else it will not work
			if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
				await interaction.reply(
					'Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)',
				);
				dpst
					.GetRawPaste(paste_id)
					.then(async data => {
						// Try to parse the data.
						// If it doesn't work, input link was invalid.

						const rawEle = data.split(/[^\d{18}]+/g);
						const bans = rawEle.map(element => element.trim());

						console.log(typeof bans);
						console.log(bans);

						// console.log(JSON.parse(data));
						await interaction.editReply(
							`${bans.length} bans are being imported in background. Sit back and relax for a while!`,
						);
						let validBans = bans.length;
						// Ban users
						bans.forEach(async v => {
							console.log(`Banning user ID ${v}...`);
							await rest
								.put(Routes.guildBan(interaction.guildId, v), {
									reason: `Ban Import on ${date.toDateString()}`,
								})
								.catch(() => {
									validBans = validBans - 1;
								});
						});
						await interaction.editReply(
							`Ban List: ${bans.length}. \nInvalid Bans: ${bans.length -
								validBans}.\n${validBans} imported successfully!`,
						);
					})
					.catch(async e => {
						// When the link is invalid. this code prevented earlier versions of crashes.
						await interaction.editReply(
							`Given PasteBin link is invalid...\nLink: ${paste_id} \nError dump:\n\`${e}\``,
						);
					});
			}
			else {
				// When people do not have the permissions to ban.
				await interaction.reply(
					'You cannot just ban anybody by importing 🤷. Contact Server Moderators!',
				);
			}
		}
		else {
			await interaction.reply('Need to be in Server to work!');
		}
	},
};
