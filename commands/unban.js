const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true),
		),

	async execute(interaction) {
		const target = interaction.options.getUser('user');
		try {
			if (interaction.guild) {
				if (
					interaction.member.permissions.has([Permissions.FLAGS.BAN_MEMBERS])
				) {
					interaction.guild.members.unban(target);
					await interaction.reply({
						content: `User \`${target.tag}\` is unbanned from this server.`,
					});
				}
				else {
					await interaction.reply('You cannot unban...');
				}
			}
			else {
				interaction.reply('Need to be in Server to work!');
			}
		}
		catch (e) {
			await interaction.reply({
				content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${e}\``,
				components: [SupportRow],
			});
		}
	},
};
