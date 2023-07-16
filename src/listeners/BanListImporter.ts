import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { retry, sleepSync } from '@sapphire/utilities';
import {
  ButtonStyle,
  ComponentType,
  Guild,
  type APIEmbed,
  type MessagePayloadOption,
} from 'discord.js';
import { createPaste } from 'dpaste-ts';
import { sequentialPromises } from 'yaspr';
import { COLORS } from '../lib/Constants';
import Database from '../lib/Database';
import { BUEvents } from '../lib/EventTypes';
import type { BanEntityWithReason, BanImportOptions } from '../lib/typeDefs';
import { fetchAllBans, truncateString } from '../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Ban List Importer',
  event: BUEvents.BanListImport,
})
export default class UserEvent extends Listener {
  public override async run({
    list,
    destinationGuild: guild,
    requesterUser: user,
    sourceMessage: message,
  }: BanImportOptions) {
    // this.container.logger.debug(JSON.stringify(list));

    this.container.logger.debug('Starting bans in:', guild.name);

    if (list.length === 0) {
      return message.reply({
        content: 'No bans found in the list',
      });
    }

    const successBans = new Set<BanEntityWithReason>();
    const failedBans = new Set<BanEntityWithReason>();
    const bansInGuild = new Set((await fetchAllBans(guild)).keys());

    // this.container.logger.debug(bansInGuild.size);
    const uniqueList = list.filter((ban) => !bansInGuild.has(ban.id));
    const performBan = async (ban: BanEntityWithReason) =>
      retry(
        async () =>
          guild.members
            .ban(ban.id, {
              reason: ban.reason || `Imported by ${user.username} on ${new Date().toUTCString()}`,
            })
            .then(() => {
              successBans.add(ban);
            })
            .catch(() => {
              failedBans.add(ban);
              return sleepSync(1000);
            }),
        3,
      );

    await sequentialPromises(uniqueList, performBan).catch(async (err) =>
      message.reply({
        content: `${user}\nAn error occurred while importing ban list: ${err.message}`,
      }));
    this.container.logger.debug(
      'Ban stats:\n',
      JSON.stringify(
        {
          Server: guild.name,
          Success: successBans.size,
          Failed: failedBans.size,
          Unique: uniqueList.length,
          Total: list.length,
        },
        null,
        2,
      ),
    );
    const operationEmbed = {
      title: 'Ban list imported!',
      description: 'Ban statistics:',
      color: COLORS.hammerHandle,
      fields: [
        {
          name: 'Successful bans',
          value: `${successBans.size}`,
        },
        {
          name: 'Failed bans',
          value: `${failedBans.size}`,
        },
        {
          name: 'Unique Bans',
          value: `${uniqueList.length}`,
        },
        {
          name: 'Total bans',
          value: `${list.length}`,
        },
      ],
      footer: {
        text: `Requested by ${user.username}`,
        icon_url: user.displayAvatarURL(),
      },
    };
    this.sendLog(guild.id, operationEmbed);
    return message.reply({
      content: `${user}`,
      embeds: [operationEmbed],
      components:
        failedBans.size > 0
          ? [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  label: 'Unsuccessful ban list link',
                  style: ButtonStyle.Link,
                  url: await createPaste({
                    content: JSON.stringify(Array.from(failedBans), null, 2),
                    title: `[FAILED] ${truncateString(guild.name, 10)} Ban List`,
                  }),
                },
              ],
            },
          ]
          : undefined,
    });
  }

  public async sendLog(
    guildId: Guild['id'],
    embed: APIEmbed,
    components?: MessagePayloadOption['components'],
  ) {
    const settings = await Database.getSettings(guildId);
    if (!settings || !settings.sendBanImportLog) return;

    const webhook = await this.container.client.fetchWebhook(settings.webhookId);
    if (!webhook) return;

    await webhook.send({
      embeds: [embed],
      components,
    });
  }
}
