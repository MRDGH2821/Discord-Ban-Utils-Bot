const webhookIcon = 'https://i.imgur.com/2dmfOEw.png';
async function logsHook(channel) {
  return channel
    .createWebhook('Ban Utils Logging', {
      avatar: webhookIcon,
    })
    .then((webhook) => {
      console.log('Created webhook!', webhook);
      return webhook;
    })
    .catch(console.error);
}

module.exports = {
  logsHook,
};
