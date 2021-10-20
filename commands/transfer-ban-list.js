const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer-bans')
		.setDescription('Transfers Bans across servers'),

	async execute(interaction) {
		await interaction.deferReply('Fetching Guilds');
		const emb = {
			description:'Guild fetcher',
		};

		const guilds = [];
		for (const [, guild] of interaction.client.guilds.cache) {
			await guild.members.fetch(interaction.user).then(() => guilds.push(guild)).catch(error => console.log(error));
		}

		const servers = [];
		for (let i = 0; i < Object.keys(guilds).length;i++) {
			servers.push({ label: Object.entries(guilds)[i][1].name, value:Object.entries(guilds)[i][1].id });
		}

		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(servers),
			);
		await interaction.editReply({ embeds:[emb], components: [row] });
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
	},
};

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
