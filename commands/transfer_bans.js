const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageEmbed,
  Permissions,
  MessageActionRow,
  MessageSelectMenu
} = require('discord.js');
const { NUMBER } = require('../lib/Constants');
const { SupportRow, InviteRow } = require('../lib/RowButtons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer_bans')
    .setDescription('Transfers Bans across servers'),

  async execute(interaction) {
    await interaction.deferReply();
    const isInGuild = await interaction.inGuild();
    let selectedServerName = '';
    try {
      if (isInGuild) {
        const botGuilds = await interaction.client.guilds.cache,
          initial_Screen = new MessageEmbed()
            .setColor('#D8D4D3')
            .setTitle('**Ban List transferer**')
            .setDescription('Fetching Mutual Servers on which you can transfer bans to. \nPlease wait...'),
          message = await interaction.editReply({
            embeds: [initial_Screen],
            fetchReply: true
          }),
          msgcollector = message.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            time: 15000
          }),
          mutualBanGuilds = [],
          serverList = [],
          sourceBans = await interaction.guild.bans.fetch();

        for (const [, guild] of botGuilds) {
          // eslint-disable-next-line no-await-in-loop
          await guild.members
            .fetch({
              force: true,
              user: interaction.user
            })
            .then((member) => {
              if (member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                mutualBanGuilds.push(guild);
              }
            })
            .catch((error) => console.error(error));
        }

        mutualBanGuilds.forEach((guild) => {
          if (guild.name !== interaction.guild.name) {
            serverList.push({
              label: guild.name,
              value: guild.id
            });
          }
        });
        console.log(serverList);

        if (serverList.length > NUMBER.zero) {
          const selectServerRow = new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId('select-server')
            .setPlaceholder('Choose a server')
            .setMaxValues(NUMBER.one)
            .addOptions(serverList));
          initial_Screen.setDescription('Select Target Server where you wish to transfer bans. Bans will be transferred from current server');
          await interaction.editReply({
            components: [selectServerRow],
            embeds: [initial_Screen],
            fetchReply: true
          });

          let destinationGuild = '';

          msgcollector.on('collect', async(interacted) => {
            if (interacted.user.id === interaction.user.id) {
              destinationGuild = await interaction.client.guilds.fetch(interacted.values[0]);

              initial_Screen.setDescription(`Source Server: ${interaction.guild.name}\nDestination Server: ${destinationGuild.name}`);

              await interaction.editReply({
                components: [],
                embeds: [initial_Screen],
                fetchReply: true
              });
              selectedServerName = destinationGuild.name;
              msgcollector.stop(`Selected guild: ${destinationGuild.name}`);
            }
            else {
              await interacted.reply({
                content: 'These buttons aren\'t for you!',
                ephemeral: true
              });
            }
          });

          msgcollector.on('end', async(collected) => {
            if (collected.size === NUMBER.one) {
              initial_Screen.addField(
                '**Beginning Transfer...**',
                'You can sit back and relax while the bot does the work for you!'
              );
              await interaction.editReply({
                embeds: [initial_Screen],
                fetchReply: true
              });

              const alreadyBanned = await destinationGuild.bans.fetch();

              console.log('Type of Source bans:', typeof sourceBans);
              console.log('Type of Already banned:', typeof alreadyBanned);

              let actualTransfers = 0;
              for (const [, newBaninfo] of sourceBans.difference(alreadyBanned)) {
                actualTransfers += NUMBER.one;

                const { user, reason } = newBaninfo;

                destinationGuild.members.ban(user.id, {
                  reason
                });
              }

              initial_Screen.addFields([
                {
                  name: '**Transfer Successful!**',
                  value: `Bans were transferred from **\`${interaction.guild.name}\`** to **\`${destinationGuild.name}\`**`
                },
                {
                  name: '**Statistics**',
                  value: `Bans in \`${interaction.guild.name}\`: **\`${sourceBans.size}\`**\nBans in \`${destinationGuild.name}\`: **\`${alreadyBanned.size}\`**\nUnique Bans: **\`${actualTransfers}\`**`
                }
              ]);

              await interaction.editReply({
                components: [],
                embeds: [initial_Screen],
                fetchReply: true
              });
            }
            else {
              // when the interaction times out
              initial_Screen.setDescription('Please Select Something!\nRe-run the command again!');

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
          initial_Screen.setDescription('No mutual servers found where you can ban!\nBest contact mutual server mods & tell them to do it');

          await interaction.editReply({
            components: [],
            embeds: [initial_Screen],
            fetchReply: true
          });
        }
      }
      else {
        throw new Error(`Inside server? ${isInGuild}`);
      }
    }
    catch (error) {
      const transfer_fail = new MessageEmbed()
        .setColor('ff0033')
        .setTitle('**Cannot Transfer...**')
        .setDescription('Cannot transfer bans.\n\nIf this error is comming even after passing all checks, then please report the Error Dump section to developer.')
        .addFields([
          {
            name: '**Checks**',
            value: `Executed In server? **\`${isInGuild}\`**`
          },
          {
            name: '**Possible solutions**',
            value:
              'Use this command inside a server. Also make sure that in the other server you have ban permissions & this bot\'s role is above most of the roles.'
          },
          {
            name: '**Selected Server**',
            value: `${selectedServerName}`
          },
          {
            name: '**Bot Error Dump**',
            value: `${error}`
          }
        ]);

      await interaction.editReply({
        components: [
          SupportRow,
          InviteRow
        ],
        embeds: [transfer_fail]
      });
      console.error(error);
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

/* 12 Jan 2022
   Command refactored to use DJS constructs instead of REST API */
