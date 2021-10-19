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
		const client = new Client({ intents: [Intents.FLAGS.GUILDS], partials: ['CHANNEL', 'REACTION'] });


		const guilds = await client.guilds.cache.map(guild => guild.id);
		console.log(guilds);

		const guilds2 = Promise.all(
			client.guilds.cache.map(async guild => [
				guild.id,
				await guild.members.fetch(interaction.member).catch(() => null),
			]),
		).then(guilds2 => guilds2.filter(g => g[1]).map(guild => client.guilds.resolve(guild[0])));
		console.log(guilds2);

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
