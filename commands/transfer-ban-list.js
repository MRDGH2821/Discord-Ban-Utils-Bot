const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const { MessageActionRow, MessageSelectMenu, Client, Intents } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(token);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer-bans')
		.setDescription('Transfers Bans across servers'),

	async execute(interaction) {
		const emb = {
			description:'Guild fetcher',
		};
		
		const guilds = [];
		for (const [,guild] of interaction.client.guilds.cache) {
			await guild.members.fetch(interaction.user).then(()=>guilds.push(guild)).catch(()=>{});
		}
		console.log(guilds);

		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'me',
							description: 'description',
							value: 'option_first',
						},
						{
							label: 'me too',
							description: ' description',
							value: 'option_second',
						},
					]),
			);
		await interaction.reply({ embeds:[emb], components: [row] });

	},
};
