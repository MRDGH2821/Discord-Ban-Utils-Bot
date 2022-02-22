// eslint-disable-next-line no-unused-vars
const { Guild, MessageEmbed } = require('discord.js');
const { NUMBER, EMBCOLORS } = require('../lib/Constants.js');
const { db } = require('../lib/firebase.js');
const { createWebhook } = require('../lib/UtilityFunctions.js');

module.exports = {
  name: 'guildCreate',

  /**
   * creates webhook on joining new server if found in database
   * @async
   * @function execute
   * @param {Guild} guild - guild object
   */
  // eslint-disable-next-line sort-keys
  async execute(guild) {
    const serverDB = await db.collection('servers').doc(guild.id).get();
    try {
      if (serverDB.exists) {
        const guildData = serverDB.data(),
          guildLogChannel = await guild.channels.fetch(guildData.logChannelID),
          newWebhook = await guild
            .fetchWebhooks()
            .then((webhooks) => {
              const allhooks = webhooks.filter(
                (wh) => wh.owner === guild.client.user
              );
              // console.log(allhooks);
              if (allhooks.size > NUMBER.one) {
                const qty = allhooks.size;
                console.log(`Found ${qty} webhooks`);
                allhooks.forEach((hook) => {
                  hook.delete('Redundant webhook');
                });
                throw new Error(
                  `Found ${qty} webhooks. Which are now deleted explicitly.`
                );
              } else {
                const hook = allhooks.first();
                // console.log(hook);
                hook.edit({
                  channel: guildLogChannel.id
                });
                return hook;
              }
            })
            .catch((error) => {
              console.error(error);
              console.log('Creating new webhook...');
              return createWebhook(guildLogChannel);
            }),
          setDBdata = {
            logChannelID: guildLogChannel.id,
            logWebhookID: newWebhook.id,
            serverID: guild.id
          },
          settingsRestored = new MessageEmbed()
            .setTitle('**Log Channel Settings Restored**')
            .setColor(EMBCOLORS.invisible)
            .setDescription(
              `Log settings are now restored.\nBot logs will now come at <#${guildData.logChannelID}>`
            )
            .setTimestamp();

        await db
          .collection('servers')
          .doc(guild.id)
          .set(setDBdata, { merge: true })
          .then(() => console.log('Updated Database!'));

        newWebhook
          .send({
            embeds: [settingsRestored]
          })
          .catch(console.error);
      } else {
        console.log('No data found in database for new server');
      }
    } catch (error) {
      console.log("Server data doesn't exist\n\nError dump:");
      console.error(error);
    }
  }
};
