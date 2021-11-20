const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Permissions } = require('discord.js');
const { token } = require('../config.json');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();
console.log(date.toDateString());

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mass_ban')
		.setDescription('Mass Bans given IDs')
		.addStringOption(option =>
			option
				.setName('ids')
				.setDescription('Enter IDs')
				.setRequired(true),
		),

	async execute(interaction) {
		const ids = interaction.options.getString('ids');
		try {
			if (interaction.guild) {
				// User should have ban permissions else it will not work
				if (
					interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
				) {
					await interaction.reply(
						'Parsing... (If it is taking long time, bot has probably crashed)',
					);

					try {
						const rawEle = ids.split(/\D+/g);
						const bans = rawEle.map(element => element.trim());
						await interaction.client.users.fetch(bans[0]);
						await interaction.editReply(
							`${bans.length} bans are being imported in background. Sit back and relax for a while!`,
						);
						let validBans = bans.length;
						// Ban users

						// console.log(typeof bans);
						// console.log(bans);
						for (const v of bans) {
							try {
								const tag = await interaction.client.users
									.fetch(v)
									.then(user => user.tag)
									.catch(() => {
										null;
										// validBans = validBans - 1;
									});
								console.log(`Banning user ID ${tag}...`);
								await interaction.editReply(`Banning user ID ${tag}...`);
								await rest.put(Routes.guildBan(interaction.guildId, v), {
									reason: `Ban Import on ${date.toDateString()}`,
								});
							}
							catch {
								validBans = validBans - 1;
							}
						}
						await interaction.editReply(
							`Ban List: ${bans.length}. \nInvalid Bans: ${bans.length -
								validBans}.\n${validBans} imported successfully!`,
						);
					}
					catch (e) {
						// When the link is invalid. this code prevented earlier versions of crashes.
						await interaction.editReply({
							content: `There was some unexpected error. \nError dump:\n\`${e}\``,
							components: [SupportRow],
						});
					}
				}
				else {
					// When people do not have the permissions to ban.
					await interaction.reply({
						content:
							'You cannot just ban anybody by importing 🤷. Contact Server Moderators!\nOr invite the bot in your server!',
						components: [InviteRow],
					});
				}
			}
			else {
				await interaction.reply({
					content:
						'Are you sure you are in a server to execute this?:unamused:  \nBecause this command can only be used in Server Text channels or Threads :shrug:',
					components: [InviteRow],
				});
			}
		}
		catch (e) {
			await interaction.reply({
				content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
				components: [SupportRow],
			});
		}
	},
};
