// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
  name: 'ready',
  once: true,

  /**
   * ready event
   * @function execute
   * @param {Client} client
   */
  // eslint-disable-next-line sort-keys
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    const activities = [
        {
          msg: `/help in ${client.guilds.cache.size} servers`,
          obj: { type: 'LISTENING' }
        },
        {
          msg: 'a ban hammer being dropped',
          obj: { type: 'WATCHING' }
        },
        {
          msg: `bot version ${version}`,
          obj: { type: 'PLAYING' }
        },
        {
          msg: '',
          obj: {
            type: ''
          }
        },
        {
          msg: 'Justice Hammer',
          obj: {
            type: 'PLAYING'
          }
        },
        {
          msg: 'a ban list being exported',
          obj: {
            type: 'WATCHING'
          }
        },
        {
          msg: 'a ban list import',
          obj: {
            type: 'LISTENING'
          }
        }
      ],
      delay = 30000;
    // console.log(activities);

    setInterval(() => {
      const act = activities[Math.floor(Math.random() * activities.length)];
      console.log(act);
      client.user.setActivity(act.msg, act.obj);
    }, delay);
  }
};
