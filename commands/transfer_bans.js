const {
  Permissions,
  MessageActionRow,
  MessageSelectMenu,
  MessageEmbed,
  MessageButton
} = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { token } = require('../lib/ConfigManager.js');
const { InviteRow, SupportRow } = require('../lib/RowButtons.js'),
  rest = new REST({ version: '9' }).setToken(token);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer_bans')
    .setDescription('Transfers Bans across servers'),

  async execute(interaction) {
    try {
      if (interaction.guild) {
        const guilds = [],
          initial_Screen = new MessageEmbed()
            .setColor('#D8D4D3')
            .setTitle('**Ban List transferer**')
            .setDescription('Fetching Mutual Servers on which you can transfer bans to. \nPlease wait...'),
          message = await interaction.reply({
            embeds: [initial_Screen],
            fetchReply: true
          }),
          msgcollector = message.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: 15000
          }),
          servers = [],
          // fetch bans from current server
          sourcebans = await rest.get(Routes.guildBans(interaction.guild.id));
        // fetches mutual servers where interaction user can ban

        for (const [, guild] of interaction.client.guilds.cache) {
          // eslint-disable-next-line no-await-in-loop
          await guild.members
            .fetch({
              force: true,
              user: interaction.user
            })
            .then((member) => {
              if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                guilds.push(guild);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }

        // puts Name & Server ID in an array except current serevr

        for (let index = 0; index < Object.keys(guilds).length; index++) {
          if (
            Object.entries(guilds)[index][1].name !== interaction.guild.name
          ) {
            servers.push({
              label: Object.entries(guilds)[index][1].name,
              value: Object.entries(guilds)[index][1].id
            });
          }
        }

        /* checks if mutual servers list has atleast 1 server.
           This command is point less if you don't have another mutual server with bot.
           Hence the check */
        // eslint-disable-next-line no-magic-numbers
        if (Object.keys(servers).length > 0) {
          const row = new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('select-server')
            .setPlaceholder('Choose a Server')
          // eslint-disable-next-line no-magic-numbers
            .setMaxValues(1)
            .addOptions(servers));

          initial_Screen.setDescription('Select Target Server where you wish to transfer bans. Bans will be transferred from current server');

          await interaction.editReply({
            components: [row],
            embeds: [initial_Screen],
            fetchReply: true
          });
          // eslint-disable-next-line init-declarations
          let destname, toGuildId;

          // collectors to collect selected server
          msgcollector.on('collect', async(interacted) => {
            // this if statement is for checking if buttons are selected by interaction.user or not.
            if (interacted.user.id === interaction.user.id) {
              destname = await interaction.client.guilds.cache.get(interacted.values[0]).name;
              toGuildId = await interaction.client.guilds.cache.get(interacted.values[0]).id;

              initial_Screen.setDescription(`Source server: ${interaction.guild.name}\nDestination Server: ${destname}`);
              // interaction.client.guilds.cache.get(i.values[0]).name

              await interaction.editReply({
                components: [],
                embeds: [initial_Screen],
                fetchReply: true
              });
            }
            else {
              await interacted.reply({
                content: 'These buttons aren\'t for you!',
                ephemeral: true
              });
            }

            /*  possibly avoided race condition
                // Double assignment to ensure values are properly passed
               destname = await interaction.client.guilds.cache.get(interacted.values[0])
                 .name;
               toGuildId = await interaction.client.guilds.cache.get(interacted.values[0])
                 .id; */
          });

          // console.log('Source Bans:\n\n', bans);

          msgcollector.on('end', async(collected) => {
            // eslint-disable-next-line no-magic-numbers
            if (collected.size === 1) {
              initial_Screen
                .addField(
                  '**Beginning Transfer...**',
                  'You can sit back and relax while the bot does the work for you!'
                )
                .setFooter('Transfer has begun, still you should check destination server setting\'s ban section.');

              await interaction.editReply({
                embeds: [initial_Screen],
                fetchReply: true
              });
              console.log(`Collected ${collected.size} interactions. Collected: ${collected}`);

              const alreadybanned = await rest.get(Routes.guildBans(toGuildId)),
                fromGuildId = interaction.guild.id;
              // console.log('Already banned\n\n', alreadybaned);

              try {
                // tries to ban users.
                console.log(`Fetching bans for guild ${destname}...`);
                console.log(`Found ${sourcebans.length} bans.`);
                console.log(`Applying bans to guild ${toGuildId}...`);
                let actualTransfers = 0;
                for (const newBan of sourcebans.filter((newPotentialBan) => !alreadybanned.some((banned) => banned.user.id === newPotentialBan.user.id))) {
                  // eslint-disable-next-line no-magic-numbers
                  actualTransfers += 1;
                  // console.log(`Banning user ${v.user.username}#${v.user.discriminator}...`);
                  // eslint-disable-next-line no-await-in-loop
                  await interaction.editReply({
                    content: `Banning user ${newBan.user.username}#${newBan.user.discriminator}...`
                  });
                  // eslint-disable-next-line no-await-in-loop
                  await rest.put(Routes.guildBan(toGuildId, newBan.user.id), {
                    reason: newBan.reason
                  });
                }
                //  interaction.client.guilds.cache.get(toGuildId).name
                initial_Screen
                  .addField(
                    '**Transfer Successfull!**',
                    `Found ${sourcebans.length} in current server.\nTransferred successfully to ${destname}.\nUnique Bans: ${actualTransfers}`
                  )
                  .setFooter(`Check by going into destination server's ban section. It should be increased by ${actualTransfers}`);
                console.log(`Successfully transferred all bans from ${fromGuildId} to ${toGuildId}.`);
                await interaction.editReply({
                  components: [],
                  content: 'Ban Transfer Successful!',
                  embeds: [initial_Screen],
                  fetchReply: true
                });
              }
              catch (error) {
                // crash prevention code. Bot might hit API Rate limit when ban list is too big.
                const apiErrorRow = new MessageActionRow()
                  .addComponents(new MessageButton()
                    .setLabel('Report Issue at GitHub')
                    .setURL('https://github.com/MRDGH2821/Discord-Ban-Utils-Bot/issues')
                    .setStyle('LINK'))
                  .addComponents(new MessageButton()
                    .setLabel('Report Issue at Support Server')
                    .setURL('https://discord.gg/MPtE9zsBs5')
                    .setStyle('LINK'));
                initial_Screen.addField(
                  '**Error**',
                  `Seems like I failed. Try again after sometime?\n\nError Dump:\n ${error}`
                );
                console.log(error);
                await interaction.editReply({
                  component: [apiErrorRow],
                  embeds: [initial_Screen],
                  fetchReply: true
                });
              }
            }
            else {
              // when the interaction times out
              initial_Screen
                .setDescription('Please Select Something!')
                .setFooter('Re-run the command again!');
              await interaction.editReply({
                components: [],
                embeds: [initial_Screen],
                ephemeral: true,
                fetchReply: true
              });
            }
          });
        }
        else {
          // when mutual servers are less than 1
          initial_Screen
            .setDescription('No mutual servers found where you can ban!')
            .setFooter('Best contact mutual server mods & tell them to do it');
          await interaction.editReply({
            components: [],
            embeds: [initial_Screen],
            fetchReply: true
          });
        }
      }
      else {
        await interaction.reply({
          components: [InviteRow],
          content: 'Its best if this command is used inside a server.'
        });
      }
    }
    catch (error) {
      await interaction.reply({
        components: [SupportRow],
        content: `Unexpected Error Occured! \nPlease Report to the Developer. \nError Dump:\n\`${error}\``
      });
    }
  }
};

/* 25 Oct 2021
   I'll be honest here, this piece of code has taken a long time to get function & crash proof.
   I asked 2-3 questions on Stack overflow to get this working.
   This approach will fail when bot reaches more than 2000 servers.
   And I'm kinda afraid of that because I don't know how to use OAuth & Sharding.
   + I would need to monetize this bot since I would have to change the hosting platform from Raspberry Pi to Virtual Private Server. */

/* 28 Nov 2021
   Finally the bot will wait after processing each ban instead of ejecting all bans at once.
   I had no idea of async & await keyword usages hence things happened in one go instead of waiting. */

/* 04 Dec 2021
   AroLeaf helps to filter out duplicate bans */

/* 28 Dec 2021
   Bot Developer now definitely knows how to inform the mod. */
