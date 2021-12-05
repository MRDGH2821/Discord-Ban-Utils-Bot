const { version } = require('../package.json');

module.exports = {
	name: 'ready',
	once: true,

	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		/*
		client.user.setActivity(`/help. Bot Version: ${version}`, {
			type: 'LISTENING',
		});
		*/
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
			{
				text: '',
				obj: {
					type: '',
				},
			},
			{
				text: 'Justice Hammer',
				obj: {
					type: 'PLAYING',
				},
			},
			{
				text: 'a ban list being exported',
				obj: {
					type: 'WATCHING',
				},
			},
		];
		console.log(activities);

		setInterval(() => {
			const act = activities[Math.floor(Math.random() * activities.length)];
			console.log(act);
			client.user.setActivity(act.text, act.obj);
		}, 5000);
	},
};
