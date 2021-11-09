const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, pasteUser, pastePass, pasteKey } = require('../betaconfig.json');
const { MutualServers } = require('../lib/MutualServerFnc.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const {
	MessageActionRow,
	MessageSelectMenu,
	MessageEmbed,
} = require('discord.js');

const paste = require('better-pastebin');

const rest = new REST({ version: '9' }).setToken(token);
const date = new Date();

paste.setDevKey(pasteKey);
paste.login(pasteUser, pastePass);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export_ban_list')
		.setDescription('Exports ban list of current server')
		.addStringOption(option =>
			option
				.setName('expiry')
				.setDescription(
					'Set expiry of the generated pastebin. (Default: 1 Day)',
				)
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

		try {
			// Fetch bans
			if (interaction.guild) {
				const bans = await rest.get(Routes.guildBans(interaction.guildId));
				await interaction.deferReply(`Found ${bans.length} bans. Exporting...`);
				console.log(`Found ${bans.length} bans. Exporting...`);

				// Export bans
				let results = [];
				bans.forEach(v => {
					results.push(v.user.id);
				});
				results = JSON.stringify(results);
				// console.log(results);

				// Send bans to pastebin
				const outputFile = `${interaction.guild.name}-${date}.txt`;
				paste.create(
					{
						contents: results,
						name: outputFile,
						expires: expiry,
						anonymous: 'true',
					},
					function(success, data) {
						if (success) {
							// Returns the pastebin link
							return interaction.editReply({
								content: data,
								components: [InviteRow],
							});
						}
						else {
							// Incase of any errors
							return interaction.editReply({
								content: 'There was some unexpected error.',
								components: [SupportRow],
							});
						}
					},
				);
			}
			else {
				const initial_Screen = new MessageEmbed()
					.setColor('#D8D4D3')
					.setTitle('Ban List Exporter')
					.setDescription(
						'Fetching Mutual Servers from which you can export Ban List. \nPlease wait...',
					);

				const message = await interaction.reply({
					embeds: [initial_Screen],
					fetchReply: true,
				});

				const collector = message.createMessageComponentCollector({
					componentType: 'SELECT_MENU',
					time: 15000,
				});

				const guilds = MutualServers(interaction);
				const servers = [];
				for (let i = 0; i < Object.keys(guilds).length; i++) {
					servers.push({
						label: Object.entries(guilds)[i][1].name,
						value: Object.entries(guilds)[i][1].id,
					});
				}

				if (Object.keys(servers).length > 0) {
					const row = new MessageActionRow().addComponents(
						new MessageSelectMenu()
							.setCustomId('select-server')
							.setPlaceholder('Choose a Server')
							.setMaxValues(1)
							.addOptions(servers),
					);

					initial_Screen.setDescription(
						'Select The server from which you wish to fetch bans.',
					);

					await interaction.editReply({
						embeds: [initial_Screen],
						components: [row],
						fetchReply: true,
					});
					let bans;
					let selectedGuild;
					collector.on('collect', async i => {
						if (i.user.id === interaction.user.id) {
							selectedGuild = interaction.client.guilds.cache.get(i.values[0]);
							// console.log(selectedGuild);
							bans = await rest.get(Routes.guildBans(selectedGuild.id));
							initial_Screen
								.setDescription(`Selected server: ${selectedGuild.name}`)
								.setFooter(
									'Please wait for a while even if it says interaction failed',
								);
							await interaction.editReply({
								embeds: [initial_Screen],
								components: [],
								fetchReply: true,
							});
						}
						else {
							interaction.reply({
								content: 'These commands are not for you!',
								ephemeral: true,
							});
						}
					});

					collector.on('end', async collected => {
						if (collected.size === 1) {
							initial_Screen
								.addFields({
									name: '\u200b',
									value: `Found ${bans.length} bans. Exporting...`,
								})
								.setFooter('');
							await interaction.editReply({
								embeds: [initial_Screen],
								components: [InviteRow],
								fetchReply: true,
							});
							console.log(`Found ${bans.length} bans. Exporting...`);
							console.log(bans);

							// Export bans
							let results = [];
							bans.forEach(v => {
								results.push(v.user.id);
							});
							results = JSON.stringify(results);
							const outputFile = `${selectedGuild.name}-${date}.txt`;

							paste.create(
								{
									contents: results,
									name: outputFile,
									expires: expiry,
									anonymous: 'true',
								},
								function(success, data) {
									if (success) {
										// Returns the pastebin link
										return interaction.followUp(data);
									}
									else {
										// Incase of any errors
										return interaction.followUp(
											'There was some unexpected error.',
										);
									}
								},
							);
						}
						else {
							initial_Screen.setDescription('Please select something!');
							await interaction.editReply({
								embeds: [initial_Screen],
								components: [InviteRow],
							});
						}
					});
				}
				else {
					// When mutual servers are less than 1
					initial_Screen.setDescription(
						'No Mutual servers Found. Invite the bot in your server to use this command!',
					);
					await interaction.editReply({
						embeds: [initial_Screen],
						components: [InviteRow],
						fetchReply: true,
					});
				}
			}
		}
		catch (e) {
			interaction.reply({
				content: `Unexpected error occured, please report it to the developer! \nError dump:\n\n\`${e}\``,
				components: [SupportRow],
			});
		}
	},
};
