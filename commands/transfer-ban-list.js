const { REST } = require('@discordjs/rest');
const { Permissions } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const rest = new REST({ version: '9' }).setToken(token);

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer-bans')
		.setDescription('Transfers Bans across servers'),

	async execute(interaction) {

		const initial_Screen = new MessageEmbed()
			.setTitle('Ban List transferer')
			.setDescription('Fetching Mutual Servers on which you can transfer bans to. \nPlease wait...');

		const message = await interaction.reply({ embeds: [initial_Screen], fetchReply: true });

		const collector = message.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 15000 });

		const guilds = [];
		for (const [, guild] of interaction.client.guilds.cache) {
			try {
				const member = await guild.members.fetch({ user:interaction.user, force:true });
				if (member) {
					if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
						guilds.push(guild);
					}
				}
			}
			catch (e) {console.log(e);}
		}

		const servers = [];
		for (let i = 0; i < Object.keys(guilds).length;i++) {
			if (Object.entries(guilds)[i][1].name != interaction.guild.name) {
				servers.push({ label: Object.entries(guilds)[i][1].name, value:Object.entries(guilds)[i][1].id });
			}
		}
		console.log('servers');
		console.log(typeof servers);
		console.log(servers);
		if (Object.keys(servers).length > 0) {
			const row = new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('select-server')
						.setPlaceholder('Choose a Server')
						.setMaxValues(1)
						.addOptions(servers),
				);

			initial_Screen.setDescription('Select Target Server where you wish to transfer bans. Bans will be transferred from current server');

			await interaction.editReply({ embeds:[initial_Screen], components: [row], fetchReply: true });
			let toGuildId;
			let destname;
			collector.on('collect', i => {
				if (i.user.id === interaction.user.id) {

					destname = interaction.client.guilds.cache.get(i.values[0]).name;
					toGuildId = interaction.client.guilds.cache.get(i.values[0]).id;

					initial_Screen
						.setDescription(`Source server: ${interaction.guild.name}\nDestination Server: ${interaction.client.guilds.cache.get(i.values[0]).name}`);

					interaction.editReply({ embeds:[initial_Screen], components: [], fetchReply: true });
				}
				else {
					i.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
				}
				destname = interaction.client.guilds.cache.get(i.values[0]).name;
				toGuildId = interaction.client.guilds.cache.get(i.values[0]).id;
			});

			const bans = await rest.get(
				Routes.guildBans(interaction.guild.id),
			);
			collector.on('end', collected => {
				if (collected.size === 1) {
					initial_Screen
						.addField('Beginning Transfer...', 'You can sit back and relax while the bot does the work for you!')
						.setFooter('Btw, bot developer doesn\'t know how to notify you after the bans have been transferred... \nHence you should check destination server setting\'s ban section.');

					interaction.editReply({ embeds:[initial_Screen], fetchReply: true });
					console.log(`Collected ${collected.size} interactions. Collected: ${collected}`);

					const fromGuildId = interaction.guild.id;

					try {
						console.log(`Fetching bans for guild ${destname}...`);
						console.log(`Found ${bans.length} bans.`);
						console.log(`Applying bans to guild ${toGuildId}...`);
						for (const v of bans) {
							console.log(`Banning user ${v.user.username}#${v.user.discriminator}...`);
							rest.put(
								Routes.guildBan(toGuildId, v.user.id),
								{ reason: v.reason },
							);
						}
						console.log(`Successfully transferred all bans from ${fromGuildId} to ${toGuildId}.`);
					}
					catch (error) {
						const apiErrorRow = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setLabel('Report Issue at GitHub')
									.setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues')
									.setStyle('LINK'),
							)
							.addComponents(
								new MessageButton()
									.setLabel('Report Issue at Support Server')
									.setURL('https://discord.gg/MPtE9zsBs5')
									.setStyle('LINK'),
							);
						initial_Screen
							.setDescription('Seems like I failed. Possible reasons: Discord API Rate Limit crossed. And thus cannot transfer bans.');
						interaction.editReply({ embeds:[initial_Screen], component:[apiErrorRow], fetchReply: true });
						console.log(error);
					}
				}
				else {

					initial_Screen
						.setDescription('Please Select Something!')
						.setFooter('Re-run the command again!');
					interaction.editReply({ embeds:[initial_Screen], components: [], fetchReply: true, ephemeral: true });
				}
			});
		}
		else {
			initial_Screen
				.setDescription('<@!897454611370213436> didn\'t find any mutual servers where you can ban!')
				.setFooter('Best contact mods & tell them to do it');
			await interaction.editReply({ embeds: [initial_Screen], components:[], fetchReply: true });
		}
	},
};
