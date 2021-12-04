const { version } = require('../package.json');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity(`/help. Bot Version: ${version}`, {
			type: 'LISTENING',
		});

		/*
		const servers = await client.guilds.cache.size;
		const activities = [
			{
				text: `/help in ${servers} servers`,
				obj: { type: 'LISTENING' },
			},
			{
				text: 'a ban hammer being dropped',
				obj: { type: 'WATCHING' },
			},
			{
				text: `bot version ${version}`,
				obj: { type: 'PLAYING' },
			},
		];
		for (const act in activities) {
			// const act = activities[Math.floor(Math.random() * activities.length)];
			setTimeout(() => {
	client.user.setActivity(act.text, act.obj);
			}, 5000);
		}
		*/
	},
};
