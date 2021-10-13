const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

const helpEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Help Section')
	.setURL('https://discord.gg/MPtE9zsBs5')
	.setDescription('The help section you get you started!\nThe bot helps you import, export & transfer bans from one server to another.')
	.addFields(
		{ name: 'Ban', value: 'As the name suggests, it bans the given user.' },
		{ name: 'Import', value: 'Imports the ban list in current server supplied from given file' },
		{ name: 'Export', value: 'Exports the Ban list of current server as a file' },
		{ name: 'Transfer', value: 'Exports the ban list from current server & imports it into target server without needing and file.' },
		{ name: 'Bot still not working?', value: 'Please join my server or the any of the test servers & elaborate how you encountered that problem. You may also submit an issue at [Github Repository](https://github.com/MRDGH2821/Discord-Time-Tag-Bot/issues)' },
	);

const row = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setLabel('Join Support Server')
			.setStyle('LINK')
			.setURL('https://discord.gg/MPtE9zsBs5'))
	.addComponents(
		new MessageButton()
			.setLabel('Join BU Test Server 1')
			.setStyle('LINK')
			.setURL('https://discord.gg/6xmJtmnWYx'))
	.addComponents(
		new MessageButton()
			.setLabel('Join BU Test Server 1')
			.setStyle('LINK')
			.setURL('https://discord.gg/tssxShnhS2'))

	.addComponents(
		new MessageButton()
			.setLabel('Report an Issue at GitHub')
			.setStyle('LINK')
			.setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues'))
	.addComponents(
		new MessageButton()
			.setLabel('GitHub Repository')
			.setStyle('LINK')
			.setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot'),
	);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('The help section to get you started!'),

	async execute(interaction) {
		await interaction.reply({ embeds:[helpEmbed], components: [row] });
	},
};
