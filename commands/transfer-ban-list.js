const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const rest = new REST({ version: '9' }).setToken(token);

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
let destname;
let destid;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer-bans')
		.setDescription('Transfers Bans across servers'),

	async execute(interaction) {
		const initial_Screen = new MessageEmbed()
			.setTitle('Ban List transferer')
			.setDescription('Fetching Mutual Servers on which you can transfer bans to. \nPlease wait...');
		//

		const message = await interaction.reply({ embeds: [initial_Screen], fetchReply: true });
		// = await interaction.fetchReply();
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
		/*
		const currentServer = servers.findIndex(element => {
			if (element.label === interaction.guild.name) {
				return true;
			}
		});
		delete servers[currentServer];
		*/
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
		//	console.log(`Interaction has: \n${interaction}`);
		console.log('\n\n\n');


		const serverID = collector.on('collect', i => {
			if (i.user.id === interaction.user.id) {
				destname = interaction.client.guilds.cache.get(i.values[0]).name;
				destid = interaction.client.guilds.cache.get(i.values[0]).id;
				console.log(destname);
				console.log(destid);
				initial_Screen.setDescription(`Source server: ${interaction.guild.name}\nDestination Server: ${interaction.client.guilds.cache.get(i.values[0]).name}`);
				interaction.editReply({ embeds:[initial_Screen], components: [], fetchReply: true });

			}
			else {
				i.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
			}
			return i.values[0];
		});

		collector.on('end', collected => {
			initial_Screen
				.addField('Beginning Transfer...', 'You can sit back and relax while the bot does the work for you!')
				.setFooter('Btw, bot developer doesn\'t know how to notify you after the bans have been transferred... \nHence you should check destination server setting\'s ban section.');

			interaction.editReply({ embeds:[initial_Screen], fetchReply: true });
			console.log(`Collected ${collected.size} interactions. Collected: ${collected}`);
		});

		const bans = await rest.get(
			Routes.guildBans(interaction.guild.id),
		);
		console.log(`Applying bans to guild ${interaction.client.guilds.cache.get(serverID).name}...`);
		for (const v of bans) {
			console.log(`Banning user ${v.user.username}#${v.user.discriminator}...`);
			await rest.put(
				Routes.guildBan(interaction.client.guilds.cache.get(serverID).id, v.user.id),
				{ reason: v.reason },
			);
		}
	},
};
/*
		const filter = i =>	interaction.isSelectMenu() && i.user.id === interaction.user.id;
		const collector = SelectMenuInteraction.message.createMessageComponentCollector({
			filter,
			max: 1,
		});

		collector.on('collect', async (collected) => {
			const value = collected.values[0];
			console.log(value);
			collected.deferUpdate();
			return interaction.followUp(value);
		});
*/


/*
		const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });

		collector.on('collect', i => {
			if (i.user.id === interaction.user.id) {
				i.editReply(`${i.user.id} clicked on the ${i.customId} button.`);
			}
			else {
				i.editReply({ content: 'These buttons aren\'t for you!', ephemeral: true });
			}
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} interactions.`);
		});
*/
/*
const filter = i => {
	i.deferUpdate();
	return i.user.id === interaction.user.id;
};
		interaction.SelectMenuInteraction.message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
			.then(console.log(`You selected ${interaction.values.join(', ')}!`))
			.catch(err => console.log(`No interactions were collected. ${err}`));
	},
	*/
/*
console.log(Object.keys(guilds).length);
console.log('\n\n\n');
// Specific server's info
console.log(Object.entries(guilds)[0][1]);
console.log('\n\n\n');
console.log(typeof Object.entries(guilds)[0][1]);
console.log('\n\n\n');
// Server's name & ID
console.log(Object.entries(guilds)[0][1].id, Object.entries(guilds)[0][1].name);
console.log('\n\n\n');
// 2nd Server's name & ID
console.log(Object.entries(guilds)[1][1].id, Object.entries(guilds)[1][1].name);
*/
