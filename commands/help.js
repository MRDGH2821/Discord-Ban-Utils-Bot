const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

const helpEmbed = new MessageEmbed()
	.setColor('#D8D4D3')
	.setTitle('Help Section')
	.setURL('https://discord.gg/MPtE9zsBs5')
	.setDescription('The help section you get you started!\nThe bot helps you import, export & transfer bans from one server to another.')
	.addFields(
		{ name: 'Ban', value: 'Bans the given user.' },
		{ name: 'Unban', value: 'Unbans the given user.' },
		{ name: 'Import', value: 'Imports the ban list from pastebin link' },
		{ name: 'Export', value: 'Exports the Ban list to pastebin' },
		{ name: 'Transfer', value: 'Exports the ban list from current server & imports it into target server without extra steps.' },
		{ name: 'Kick', value: 'Kicks the given user.' },
		{ name: 'Ping', value: 'Bot Latency.' },
		{ name: 'User-info', value: 'Tells if you have the permissions to kick or ban .' },
		{ name: 'Bot still not working?', value: 'Please join my server & elaborate how you encountered that problem. You may also submit an issue at [Github Repository](https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues)' },
	)
	.setFooter('Note from developer: "I still think that this bot is far from crash proof. I have done enough testing, but still some edge cases might be left out. Well I have configured my bot to restart on crash (using pm2), it would be nice if you report the issue ASAP to me."');

const row = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setLabel('Join Support Server')
			.setStyle('LINK')
			.setURL('https://discord.gg/MPtE9zsBs5'))
	.addComponents(
		new MessageButton()
			.setLabel('Report an Issue at GitHub')
			.setStyle('LINK')
			.setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues'))
	.addComponents(
		new MessageButton()
			.setLabel('GitHub Repository')
			.setStyle('LINK')
			.setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot'))
	.addComponents(
		new MessageButton()
			.setLabel('Invite the Bot in your server!')
			.setStyle('LINK')
			.setURL('https://discord.com/oauth2/authorize?client_id=897454611370213436&permissions=277562263718&scope=bot%20applications.commands'),
	);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('The help section to get you started!'),

	async execute(interaction) {
		await interaction.reply({ embeds:[helpEmbed], components: [row] });
	},
};
