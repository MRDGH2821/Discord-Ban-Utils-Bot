const { TIME, NUMBER } = require('./Constants'),
  webhookIcon = 'https://i.imgur.com/2dmfOEw.png';

function createWebhook(channel) {
  return channel.createWebhook('Ban Utils Logging', {
    avatar: webhookIcon
  });
}

function pasteCheck(link) {
  const excludehttps = 19;
  if ((/(https:\/\/dpaste.com\/)(.+)/gu).test(link)) {
    return link.substring(excludehttps);
  }
  return link;
}

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
