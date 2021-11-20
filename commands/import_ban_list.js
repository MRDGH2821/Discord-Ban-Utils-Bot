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
		const paste_id = PasteCheck(interaction.options.getString('pastebin_link'));
		if (interaction.guild) {
			// User should have ban permissions else it will not work
			if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
				await interaction.reply(
					'Parsing... (If it is taking long time, it means the link was invalid & bot has probably crashed)',
				);
				const data = await dpst.GetRawPaste(paste_id);
				try {
					const rawEle = data.split(/\D+/g);
					const bans = rawEle.map(element => element.trim());
					await interaction.client.users.fetch(bans[0]);
					await interaction.editReply(
						`${bans.length} bans are being imported in background. Sit back and relax for a while!`,
					);
					let validBans = bans.length;
					// Ban users
					bans.forEach(async v => {
						try {
							console.log(
								`Banning user ID ${await interaction.client.users.fetch(v)}...`,
							);
							await rest.put(Routes.guildBan(interaction.guildId, v), {
								reason: `Ban Import on ${date.toDateString()}`,
							});
						}
						catch {
							validBans = validBans - 1;
						}
					});
					await interaction.editReply(
						`Ban List: ${bans.length}. \nInvalid Bans: ${bans.length -
							validBans}.\n${validBans} imported successfully!`,
					);
				}
				catch (e) {
					// When the link is invalid. this code prevented earlier versions of crashes.
					await interaction.editReply(
						`Given PasteBin link is invalid...\nLink: https://dpaste.com/${paste_id} \nError dump:\n\`${e}\``,
					);
				}
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
