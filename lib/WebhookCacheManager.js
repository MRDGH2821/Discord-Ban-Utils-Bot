/* eslint-disable no-unused-vars */
const {
  Client,
  Webhook,
  Collection,
  BaseGuildTextChannel
} = require('discord.js');

/**
 * adds webhook into cache
 * @async
 * @function addWHCache
 * @param {Client} client - client object
 * @param {Collection<string, Webhook>} webhookColl - collection of webhook
 */
async function addWHCache(client, webhookColl) {
  const webhook = webhookColl.first();
  await client.webhooksCache.set(webhook.id, webhook);
  console.log(`Added webhook ${webhook.id} to cache`);
}

/**
 * fetches webhook from cache
 * @async
 * @function getWebhook
 * @param {Client} client - client object
 * @param {Object} SearchParams - search options object
 * @param {string} SearchParams.webhookID - webhook ID
 * @param {string} SearchParams.guildID - guild ID
 * @param {string} SearchParams.channelID - channel ID
 * @returns {Webhook} - webhook object
 */
async function getWebhook(client, { webhookID, channelID, guildID }) {
  if (webhookID) {
    console.log('Fetching webhook by Webhook ID', webhookID);
    const hook = await client.webhooksCache.find((webhook) => webhook.id === webhookID);
    return hook;
  }
  else if (channelID) {
    console.log('Fetching webhook by channel ID: ', channelID);
    const hook = await client.webhooksCache.find((webhook) => webhook.channelId === channelID);
    return hook;
  }
  else if (guildID) {
    console.log('Fetching webhook by guild ID: ', channelID);
    const hook = await client.webhooksCache.find((webhook) => webhook.guildId === guildID);
    return hook;
  }
  return null;
}

/**
 * refreshes webhook cache
 * @async
 * @function refreshCache
 * @param {Client} client - client object
 * @param {BaseGuildTextChannel} channel - guild text channel object
 */
async function refreshCache(client, channel) {
  console.log('Refreshing webhooks cache');
  if (channel) {
    await channel
      .fetchWebhooks()
      .then(async(webhooks) => {
        const myhook = webhooks.filter((wh) => wh.owner === client.user);
        await addWHCache(client, myhook);
      })
      .catch(() => {
        console.log(`No logging webhooks found for ${channel.name}`);
        // console.error(error);
      });
  }
  else {
    client.webhooksCache = new Collection();
    for (const [, guild] of client.guilds.cache) {
      // eslint-disable-next-line no-await-in-loop
      await guild
        .fetchWebhooks()
        .then(async(webhooks) => {
          const myhook = webhooks.filter((wh) => wh.owner === client.user);
          await addWHCache(client, myhook);
        })
        .catch(() => {
          console.log(`No logging webhooks found for ${guild.name}`);
          // console.error(error);
        });
    }
  }
}

/**
 * displays webhook cache contents
 * @function showCache
 * @param {Client} client - client object
 */
function showCache(client) {
  console.log(client.webhooksCache);
}

module.exports = {
  addWHCache,
  getWebhook,
  refreshCache,
  showCache
};
