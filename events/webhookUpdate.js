// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Channel } = require('discord.js');
const { EMBCOLORS } = require('../lib/Constants.js');
const { refreshCache, getWebhook } = require('../lib/WebhookCacheManager.js');

module.exports = {
  name: 'webhookUpdate',

  /**
   * send log when any webhook is updated
   * @async
   * @function execute
   * @param {Channel} channel
   */
  // eslint-disable-next-line sort-keys
  async execute(channel) {
    try {
      console.log('New channel: ', channel.name);
      console.log('New channel ID: ', channel.id);

      /* console.log('Before refresh:');
       console.log(showCache(channel.client)); */
      console.log('Refresh started!');
      await refreshCache(channel.client, channel);

      /* console.log('After refresh:');
       console.log(showCache(channel.client)); */

      const getArgs = {
          channelID: channel.id,
          webhookID: false
        },
        log_sample_2 = new MessageEmbed()
          .setColor(EMBCOLORS.invisible)
          .setTitle('Test msg via WebhookChange Event')
          .setDescription(`This is a test log, should come in ${channel}.\nThis was sent because a webhook was updated in ${channel}.\n\nThis message will come everytime whenever a webhook is updated for ${channel}. The reason for this behavior is because ${channel} is configured as logs channel for ${channel.client.user}`)
          .addField(
            '**Note**',
            'Originally meant to verify if `/set_logs` command is working reliably or not. But in other cases it would be redundant. \n\nUnfortunately their is no way to find out who or which bot updated webhook (which then could be used to stop sending this type of msg).\n\nApologies for any inconveniences.'
          ),
        newHook = await getWebhook(channel.client, getArgs);
      newHook.send({
        embeds: [log_sample_2]
      });
    }
    catch {
      console.log('No self created webhooks found.');
    }
  }
};
