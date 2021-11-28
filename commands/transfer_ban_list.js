const { REST } = require('@discordjs/rest');
const { Permissions } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../betaconfig.json');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js');
const rest = new REST({ version: '9' }).setToken(token);

const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	MessageActionRow,
	MessageSelectMenu,
	MessageEmbed,
	MessageButton,
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer_bans')
		.setDescription('Transfers Bans across servers'),

	async execute(interaction) {
		try {
			if (interaction.guild) {
				const initial_Screen = new MessageEmbed()
					.setColor('#D8D4D3')
					.setTitle('**Ban List transferer**')
					.setDescription(
						'Fetching Mutual Servers on which you can transfer bans to. \nPlease wait...',
					);

				const message = await interaction.reply({
					embeds: [initial_Screen],
					fetchReply: true,
				});

				const collector = message.createMessageComponentCollector({
					componentType: 'SELECT_MENU',
					time: 15000,
				});

				// Fetches mutual servers where interaction user can ban
				const guilds = [];
				for (const [, guild] of interaction.client.guilds.cache) {
					try {
						const member = await guild.members.fetch({
							user: interaction.user,
							force: true,
						});
						if (member) {
							if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
								guilds.push(guild);
							}
						}
					}
					catch (e) {
						console.log(e);
					}
				}

				// Puts Name & Server ID in an array except current serevr
				const servers = [];
				for (let i = 0; i < Object.keys(guilds).length; i++) {
					if (Object.entries(guilds)[i][1].name != interaction.guild.name) {
						servers.push({
							label: Object.entries(guilds)[i][1].name,
							value: Object.entries(guilds)[i][1].id,
						});
					}
				}
				/*
		console.log('servers');
		console.log(typeof servers);
		console.log(servers);
		*/

				// Checks if mutual servers list has atleast 1 server.
				// This command is point less if you don't have another mutual server with bot.
				// Hence the check
				if (Object.keys(servers).length > 0) {
					const row = new MessageActionRow().addComponents(
						new MessageSelectMenu()
							.setCustomId('select-server')
							.setPlaceholder('Choose a Server')
							.setMaxValues(1)
							.addOptions(servers),
					);

					initial_Screen.setDescription(
						'Select Target Server where you wish to transfer bans. Bans will be transferred from current server',
					);

					await interaction.editReply({
						embeds: [initial_Screen],
						components: [row],
						fetchReply: true,
					});
					let toGuildId;
					let destname;

					// Collectors to collect selected server
					collector.on('collect', async i => {
						// This if statement is for checking if buttons are selected by interaction.user or not.
						if (i.user.id === interaction.user.id) {
							destname = interaction.client.guilds.cache.get(i.values[0]).name;
							toGuildId = interaction.client.guilds.cache.get(i.values[0]).id;

							initial_Screen.setDescription(
								`Source server: ${
									interaction.guild.name
								}\nDestination Server: ${
									interaction.client.guilds.cache.get(i.values[0]).name
								}`,
							);

							await interaction.editReply({
								embeds: [initial_Screen],
								components: [],
								fetchReply: true,
							});
						}
						else {
							i.reply({
								content: 'These buttons aren\'t for you!',
								ephemeral: true,
							});
						}
						// Double assignment to ensure values are properly passed
						destname = interaction.client.guilds.cache.get(i.values[0]).name;
						toGuildId = interaction.client.guilds.cache.get(i.values[0]).id;
					});

					// Fetch bans from current server
					const bans = await rest.get(Routes.guildBans(interaction.guild.id));

					collector.on('end', async collected => {
						if (collected.size === 1) {
							initial_Screen
								.addField(
									'**Beginning Transfer...**',
									'You can sit back and relax while the bot does the work for you!',
								)
								.setFooter(
									'Btw, bot developer doesn\'t know how to notify you after the bans have been transferred... \nHence you should check destination server setting\'s ban section.',
								);

							await interaction.editReply({
								embeds: [initial_Screen],
								fetchReply: true,
							});
							console.log(
								`Collected ${collected.size} interactions. Collected: ${collected}`,
							);

							const fromGuildId = interaction.guild.id;

							try {
								// Tries to ban users.
								console.log(`Fetching bans for guild ${destname}...`);
								console.log(`Found ${bans.length} bans.`);
								console.log(`Applying bans to guild ${toGuildId}...`);
								for (const v of bans) {
									console.log(
										`Banning user ${v.user.username}#${v.user.discriminator}...`,
									);
									await interaction.editReply({
										content: `Banning user ${v.user.username}#${v.user.discriminator}...`,
									});
									await rest.put(Routes.guildBan(toGuildId, v.user.id), {
										reason: v.reason,
									});
								}
								initial_Screen
									.addField(
										'**Transfer Successfull!**',
										`Found ${
											bans.length
										} in current server.\nTransferred successfully to ${
											interaction.client.guilds.cache.get(toGuildId).name
										}.`,
									)
									.setFooter(
										'Looks like bot developer does know how to notify you after all 🤷.',
									);
								await interaction.editReply({
									content: '',
									embeds: [initial_Screen],
									fetchReply: true,
									components: [],
								});
								console.log(
									`Successfully transferred all bans from ${fromGuildId} to ${toGuildId}.`,
								);
							}
							catch (error) {
								// Crash prevention code.
								// Bot might hit API Rate limit when ban list is too big.
								const apiErrorRow = new MessageActionRow()
									.addComponents(
										new MessageButton()
											.setLabel('Report Issue at GitHub')
											.setURL(
												'https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues',
											)
											.setStyle('LINK'),
									)
									.addComponents(
										new MessageButton()
											.setLabel('Report Issue at Support Server')
											.setURL('https://discord.gg/MPtE9zsBs5')
											.setStyle('LINK'),
									);
								initial_Screen.setDescription(
									`Seems like I failed. Possible reasons: Discord API Rate Limit crossed. And thus cannot transfer bans. Try again after sometime?\n\nError Dump: ${error}`,
								);
								await interaction.editReply({
									embeds: [initial_Screen],
									component: [apiErrorRow],
									fetchReply: true,
								});
								console.log(error);
							}
						}
						else {
							// When the interaction times out
							initial_Screen
								.setDescription('Please Select Something!')
								.setFooter('Re-run the command again!');
							await interaction.editReply({
								embeds: [initial_Screen],
								components: [],
								fetchReply: true,
								ephemeral: true,
							});
						}
					});
				}
				else {
					// When mutual servers are less than 1
					initial_Screen
						.setDescription('No mutual servers found where you can ban!')
						.setFooter('Best contact mutual server mods & tell them to do it');
					await interaction.editReply({
						embeds: [initial_Screen],
						components: [],
						fetchReply: true,
					});
				}
			}
			else {
				await interaction.reply({
					content: 'Its best if this command is used inside a server.',
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
/*
25 Oct 2021
I'll be honest here, this piece of code has taken a long time to get function & crash proof.
I asked 2-3 questions on Stack overflow to get this working.
This approach will fail when bot reaches more than 2000 servers.
And I'm kinda afraid of that because I don't know how to use OAuth & Sharding.
+ I would need to monetize this bot since I would have to change the hosting platform from Raspberry Pi to Virtual Private Server.
*/
