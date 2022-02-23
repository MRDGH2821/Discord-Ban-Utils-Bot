/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
const { CreatePaste } = require('dpaste-ts');
const {
  Permissions,
  BaseGuildTextChannel,
  Client,
  Webhook,
  Guild,
  Snowflake,
  GuildBan,
  MessagePayload
} = require('discord.js');
const { db } = require('./firebase.js');
const { TIME, NUMBER, simpleIDMax, advIDMax } = require('./Constants'),
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
 * @param {MessagePayload|import('discord.js').WebhookMessageOptions} msgPayLoad - payload object
 * @param {Guild} guild - guild object
 */
async function sendHook(client, msgPayLoad, guild) {
  try {
    const loghook = await client.webhooksCache.find((webhook) => webhook.guildId === guild.id);

    loghook
      .send(msgPayLoad)
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
        .send(msgPayLoad)
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

/**
 * creates chunks of given array in given size
 * @function arrayChunks
 * @param {Array} array - array to be chunked
 * @param {Number} size - chunk size
 * @returns {Array[]} - array of chunks
 */
function arrayChunks(array, size) {
  const res = [];
  for (let idx = 0; idx < Math.ceil(array.length / size); idx++) {
    res.push([]);
  }
  for (let idx = 0; idx < array.length; idx++) {
    res[Math.floor(idx / size)].push(array[idx]);
  }
  return res;
}

/**
 * exports ban list in simple mode
 * @async
 * @function exportBanSimple
 * @param {Collection<Snowflake, GuildBan>} banColl - collection of guild bans
 * @param {string} guildName - name of the guild
 * @returns {string[]} - array of links
 */
async function exportBanSimple(banColl, guildName) {
  const arrayOfBans = arrayChunks(Array.from(banColl.values()), simpleIDMax),
    arrayOfLinks = [],
    loops = arrayOfBans.length;
  for (let loop = 0; loop < loops; loop++) {
    let listOfIDs = '';
    for (const guildBan of arrayOfBans[loop]) {
      listOfIDs = `${listOfIDs} ${guildBan.user.id}`;
    }
    // eslint-disable-next-line no-await-in-loop
    arrayOfLinks.push(await CreatePaste(
      listOfIDs,
      `${guildName} Simple ban list [Part ${
        loop + NUMBER.one
      }/${loops}] - ${new Date().toUTCString()}.txt`,
      'text'
    ));
  }
  return arrayOfLinks;
}

/**
 * exports ban list in advanced mode
 * @async
 * @function exportBanSimple
 * @param {Collection<Snowflake, GuildBan>} banColl - collection of guild bans
 * @param {string} guildName - name of the guild
 * @returns {string[]} - array of links
 */
async function exportBanAdv(banColl, guildName) {
  const arrayOfBans = arrayChunks(Array.from(banColl.values()), advIDMax),
    arrayOfLinks = [],
    loops = arrayOfBans.length;
  for (let loop = 0; loop < loops; loop++) {
    const listOfIDs = [];
    for (const guildBan of arrayOfBans[loop]) {
      const format = {
        id: guildBan.user.id,
        reason: guildBan.reason
      };
      listOfIDs.push(format);
    }
    // eslint-disable-next-line no-await-in-loop
    arrayOfLinks.push(await CreatePaste(
      JSON.stringify(listOfIDs),
      `${guildName} Advance ban list [Part ${
        loop + NUMBER.one
      }/${loops}] - ${new Date().toUTCString()}.json`,
      'json'
    ));
  }
  return arrayOfLinks;
}

module.exports = {
  createInvite,
  createWebhook,
  exportBanAdv,
  exportBanSimple,
  pasteCheck,
  sendHook,
  timeoutDurationText
};
