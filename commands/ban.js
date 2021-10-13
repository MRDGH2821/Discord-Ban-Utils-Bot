const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Enter the User ID (i.e. snowflake) or tag them')
				.setRequired(true)),
	async execute(interaction) {
		const target = interaction.options.getUser('user');
		interaction.guild.members.ban(target);
		await interaction.reply({ content: `User \`${target.tag}\` is banned from this server.`, ephemeral: true });
	},
};
