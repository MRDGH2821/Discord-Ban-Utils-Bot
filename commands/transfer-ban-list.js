const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const rest = new REST({ version: '9' }).setToken(token);

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

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
			await guild.members.fetch(interaction.user).then(() => guilds.push(guild)).catch(error => console.log(error));
		}

		const servers = [];
		for (let i = 0; i < Object.keys(guilds).length;i++) {
			if (Object.entries(guilds)[i][1].name != interaction.guild.name) {
				servers.push({ label: Object.entries(guilds)[i][1].name, value:Object.entries(guilds)[i][1].id });
			}
		}

		console.log(servers);
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
		let destname;
		let destid;
		collector.on('collect', i => {
			if (i.user.id === interaction.user.id) {

				destname = interaction.client.guilds.cache.get(i.values[0]).name;
				destid = interaction.client.guilds.cache.get(i.values[0]).id;
				console.log('\ndestname (inside collector, if scope):');
				console.log(destname);
				console.log('\ndestid (inside collector, if scope):');
				console.log(destid);

				initial_Screen
					.setDescription(`Source server: ${interaction.guild.name}\nDestination Server: ${interaction.client.guilds.cache.get(i.values[0]).name}`);

				interaction.editReply({ embeds:[initial_Screen], components: [], fetchReply: true });
			}
			else {
				i.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
			}
			destname = interaction.client.guilds.cache.get(i.values[0]).name;
			destid = interaction.client.guilds.cache.get(i.values[0]).id;
			console.log('interaction.values (inside collector, outside if-else):');
			console.log(interaction.values);
		});
		console.log('\ndestname (outside collector):');
		console.log(destname);
		console.log('\ndestid outside collector):');
		console.log(destid);
		const bans = await rest.get(
			Routes.guildBans(interaction.guild.id),
		);
		collector.on('end', collected => {
			initial_Screen
				.addField('Beginning Transfer...', 'You can sit back and relax while the bot does the work for you!')
				.setFooter('Btw, bot developer doesn\'t know how to notify you after the bans have been transferred... \nHence you should check destination server setting\'s ban section.');

			interaction.editReply({ embeds:[initial_Screen], fetchReply: true });
			console.log(`Collected ${collected.size} interactions. Collected: ${collected}`);


			const fromGuildId = interaction.guild.id;
			const toGuildId = destid;
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
		});
	},
};
