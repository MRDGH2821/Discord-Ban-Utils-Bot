const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../betaconfig.json');
const { Permissions } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(token);
const date = new Date().toDateString();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Enter Reason. (Default: No reason Given)'),
		),

	async execute(interaction) {

		const target = interaction.options.getUser('user');
		const reas = interaction.options.getString('reason');
		console.log(interaction.channel.type);
		if (interaction.channel.type === 'GUILD_TEXT' || interaction.channel.type === 'GUILD_PUBLIC_THREAD' || interaction.channel.type === 'GUILD_PRIVATE_THREAD') {
			if (interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
				if (reas === null) {
				// If no reason given, give a formatted reason
					await rest.put(
						Routes.guildBan(interaction.guildId, target.id),
						{ reason: `Banned by ${interaction.user.tag} on ${date} for "no reason"` },
					);

					await interaction.reply({ content: `User \`${target.tag}\` is banned from this server. \n||for no reason :joy:||` });
				}

				else {
				// When a reason is given.
					await rest.put(
						Routes.guildBan(interaction.guildId, target.id),
						{ reason: reas },
					);
					await interaction.reply({ content: `User \`${target.tag}\` is banned from this server. \nReason: \`${reas}\`.` });
				}
			}
			else {
				await interaction.reply('You cannot ban...');
			}
		}

		else {
			await	interaction.reply('Are you sure you are in a server to execute this?:unamused:  \nBecause this command can only be used in Server Text channels or Threads :shrug:');
		}
	} };
