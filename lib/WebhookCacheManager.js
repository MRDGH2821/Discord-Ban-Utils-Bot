async function addWHCache(client, webhookColl) {
  const webhook = webhookColl.first();
  await client.webhooksCache.set(webhook.id, webhook);
  console.log(`Added webhook ${webhook.id} to cache`);
}

async function getWebhook(client, { webhookID, channelID }) {
  if (webhookID) {
    console.log('Fetching webhook ', webhookID);
    const hook = await client.webhooksCache.find((webhook) => webhook.id === webhookID);
    return hook;
  }
  console.log('Fetching webhook which has target channel ID: ', channelID);
  const hook = await client.webhooksCache.find((webhook) => webhook.channelId === channelID);
  return hook;
}

async function refreshCache(client, channel) {
  console.log('Refreshing webhooks cache');
  if (channel) {
    await channel
      .fetchWebhooks()
      .then(async(webhooks) => {
        const myhook = await webhooks.filter((wh) => wh.owner === client.user);
        await addWHCache(client, myhook);
      })
      .catch(() => {
        console.log(`No logging webhooks found for ${channel.name}`);
        // console.error(error);
      });
  }
  else {
    for (const [, guild] of client.guilds.cache) {
      // eslint-disable-next-line no-await-in-loop
      await guild
        .fetchWebhooks()
        .then(async(webhooks) => {
          const myhook = await webhooks.filter((wh) => wh.owner === client.user);
          await addWHCache(client, myhook);
        })
        .catch(() => {
          console.log(`No logging webhooks found for ${guild.name}`);
          // console.error(error);
        });
    }
  }
}

function showCache(client) {
  console.log(client.webhooksCache);
}

module.exports = {
  addWHCache,
  getWebhook,
  refreshCache,
  showCache
};
