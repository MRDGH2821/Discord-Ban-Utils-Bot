const {
  // eslint-disable-next-line no-unused-vars
  BaseGuildTextChannel,
  // eslint-disable-next-line no-unused-vars
  Client,
  // eslint-disable-next-line no-unused-vars
  Webhook,
  // eslint-disable-next-line no-unused-vars
  MessageEmbed,
  Permissions,
  // eslint-disable-next-line no-unused-vars
  Guild
} = require('discord.js');
const { db } = require('./firebase.js');
const { TIME, NUMBER } = require('./Constants'),
  webhookIcon = 'https://i.imgur.com/2dmfOEw.png';

/**
 * creates a webhook
 * @function createWebhook
 * @param {BaseGuildTextChannel} channel - guild text channel
 * @returns {Promise<Webhook>} - promise object representing webhook
 */
function createWebhook(channel) {
  return channel.createWebhook('Ban Utils Logging', {
    avatar: webhookIcon
  });
}

/**
 * extracts dpaste link ID
 * @function pasteCheck
 * @param {string} link - dpaste link
 * @returns {string} - extracted ID
 */
function pasteCheck(link) {
  const excludehttps = 19;
  if ((/(https:\/\/dpaste.com\/)(.+)/gu).test(link)) {
    return link.substring(excludehttps);
  }
  return link;
}

/**
 * generates duration text
 * @function timeoutDurationText
 * @param {number} duration - duration in milliseconds
 * @returns {string} - duration text
 */
function timeoutDurationText(duration) {
  let days = 0,
    hours = 0,
    minutes = 0,
    weeks = 0;

  if (duration % TIME.week === NUMBER.zero) {
    weeks = duration / TIME.week;
    return `${weeks} week(s)`;
  }
  else if (duration % TIME.day === NUMBER.zero) {
    days = duration / TIME.day;
    return `${days} day(s)`;
  }
  else if (duration % TIME.hour === NUMBER.zero) {
    hours = duration / TIME.hour;
    return `${hours} hour(s)`;
  }
  minutes = duration / TIME.minute;
  return `${minutes} minute(s)`;
}

/**
 * generates bot invite link
 * @function createInvite
 * @param {Client} client - client object
 * @returns {string} bot invite link
 */
function createInvite(client) {
  const invite = client.generateInvite({
    permissions: [
      Permissions.FLAGS.VIEW_AUDIT_LOG,
      Permissions.FLAGS.KICK_MEMBERS,
      Permissions.FLAGS.BAN_MEMBERS,
      Permissions.FLAGS.MANAGE_WEBHOOKS,
      Permissions.FLAGS.VIEW_CHANNEL,
      Permissions.FLAGS.MODERATE_MEMBERS,
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.EMBED_LINKS,
      Permissions.FLAGS.ATTACH_FILES,
      Permissions.FLAGS.USE_APPLICATION_COMMANDS
    ],
    scopes: [
      'bot',
      'applications.commands'
    ]
  });
  return invite;
}

/**
 * sends a message via webhook
 * @function sendHook
 * @param {Client} client - client object
 * @param {MessageEmbed} embed - embed object
 * @param {Guild} guild - guild object
 */
async function sendHook(client, embed, guild) {
  try {
    const loghook = await client.webhooksCache.find((webhook) => webhook.guildId === guild.id);

    loghook
      .send({ embeds: [embed] })
      .then(() => {
        console.log('Webhook Fetched from cache');
      })
      .catch((error) => {
        console.log('Error in retrieving webhook from cache');
        console.error(error);
        throw error;
      });
  }
  catch (error) {
    const serverDB = await db.collection('servers').doc(guild.id)
      .get();

    if (serverDB.exists) {
      const serverData = serverDB.data(),
        serverWebhook = await client.fetchWebhook(serverData.logWebhookID);

      serverWebhook
        .send({ embeds: [embed] })
        .then(() => {
          console.log('Webhook fetched from API');
        })
        .catch((err) => {
          console.log('Webhook not found in API\nError Dump:');
          console.error(err);
        });
    }
    else {
      console.log(`Logs channel not set in ${guild.name}`);
    }
    console.log('Other Error Dump:');
    console.error(error);
  }
}
module.exports = {
  createInvite,
  createWebhook,
  pasteCheck,
  sendHook,
  timeoutDurationText
};
