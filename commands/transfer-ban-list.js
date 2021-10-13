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
		const emb = {
			description:'pong!',
		};
		const row1 = new MessageActionRow()
    			.addComponents(
    				new MessageSelectMenu()
    					.setCustomId('select')
    					.setPlaceholder('Nothing selected')
    					.addOptions([
    						{
    							label: 'Select me',
    							description: 'This is a description',
    							value: 'first_option',
    						},
    						{
    							label: 'You can select me too',
    							description: 'This is also a description',
    							value: 'second_option',
    						},
    					]),
    			);
		const row2 = new MessageActionRow()
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
    		await interaction.reply({ embeds:[emb], components: [row1] });

	},
};
