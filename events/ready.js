const { version } = require('../package.json');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		const activities = [
			{
				text: `/help in ${client.guilds.cache.size} servers`,
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
		while (activities) {
			await sleep(5);
			const act = activities[Math.floor(Math.random() * activities.length)];
			client.user.setActivity(act.text, act.obj);
		}
	},
};
