const webhookIcon = 'https://i.imgur.com/2dmfOEw.png';
// eslint-disable-next-line require-await
async function newHook(channel) {
  return channel
    .createWebhook('Ban Utils Logging', {
      avatar: webhookIcon
    })
    .then((webhook) => {
      console.log('Created webhook!', webhook);
      return webhook;
    })
    .catch(console.error);
}

async function changeHook(client, channel, webhookID) {
  const webhookClient = await client.fetchWebhook(webhookID);
  await webhookClient.edit({
    channel
  });
  return webhookClient;
}

module.exports = {
  changeHook,
  newHook
};
