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
 * @param {Client} client - Discord Client
 * @param {Collection<string, Webhook>} webhookColl
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
 * @param {Client} client - Discord Client
 * @param {Object} SearchParams - Search options
 * @param {string} SearchParams.webhookID - Webhook ID
 * @param {string} SearchParams.guildID - Guild ID
 * @param {string} SearchParams.channelID - Channel ID
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
 * @param {Client} client - Discord Client
 * @param {BaseGuildTextChannel} channel - Guild text Channel
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
 * @param {Client} client
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
