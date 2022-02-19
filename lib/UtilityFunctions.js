// eslint-disable-next-line no-unused-vars
const { BaseGuildTextChannel } = require('discord.js');
const { TIME, NUMBER } = require('./Constants'),
  webhookIcon = 'https://i.imgur.com/2dmfOEw.png';

/**
 * creates a webhook
 * @function createWebhook
 * @param {BaseGuildTextChannel} channel - Guild text channel
 * @returns {Promise} - Promise object representing webhook
 */
function createWebhook(channel) {
  return channel.createWebhook('Ban Utils Logging', {
    avatar: webhookIcon
  });
}

/**
 * extracts dpaste link ID
 * @function
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

module.exports = {
  createWebhook,
  pasteCheck,
  timeoutDurationText
};
