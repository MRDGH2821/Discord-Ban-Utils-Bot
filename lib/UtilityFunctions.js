const webhookIcon = 'https://i.imgur.com/2dmfOEw.png';

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

module.exports = {
  createWebhook,
  pasteCheck
};
