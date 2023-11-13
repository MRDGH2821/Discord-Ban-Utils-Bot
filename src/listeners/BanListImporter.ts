import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { retry, sleepSync, toTitleCase } from '@sapphire/utilities';
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
import type { BanEntityWithReason, ListImportOptions } from '../lib/typeDefs';
import { fetchAllBans, truncateString } from '../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'List Importer',
  event: BUEvents.ListImport,
})
export default class UserEvent extends Listener {
  public override async run({
    list,
    destinationGuild: guild,
    requesterUser: user,
    sourceMessage: message,
    mode,
  }: ListImportOptions) {
    // this.container.logger.debug(JSON.stringify(list));
    const titleMode = toTitleCase(mode);

    this.container.logger.debug(`Starting ${mode}s in:`, guild.name);

    if (list.length === 0) {
      return message.reply({
        content: `No ${mode}s found in the list`,
      });
    }

    const successList = new Set<BanEntityWithReason>();
    const failedList = new Set<BanEntityWithReason>();
    const bansInGuild = new Set((await fetchAllBans(guild)).keys());

    // this.container.logger.debug(bansInGuild.size);
    const uniqueList = mode === 'ban' ? list.filter((ban) => !bansInGuild.has(ban.id)) : list;

    const banFn = (id: string, reason: string) => guild.members.ban(id, { reason });
    const unBanFn = (id: string, reason: string) => guild.members.unban(id, reason);

    const actionFn = mode === 'ban' ? banFn : unBanFn;

    const performBan = async (ban: BanEntityWithReason) =>
      retry(
        async () =>
          actionFn(
            ban.id,
            ban.reason || `Imported by ${user.username} on ${new Date().toUTCString()}`,
          )
            .then(() => {
              successList.add(ban);
            })
            .catch(() => {
              failedList.add(ban);
              return sleepSync(1000);
            }),
        3,
      );

    await sequentialPromises(uniqueList, performBan).catch(async (err) =>
      message.reply({
        content: `${user}\nAn error occurred while importing ${mode} list: ${err.message}`,
      }));
    this.container.logger.debug(
      `${titleMode} stats:\n`,
      JSON.stringify(
        {
          Server: guild.name,
          Success: successList.size,
          Failed: failedList.size,
          Unique: uniqueList.length,
          Total: list.length,
          Mode: mode,
        },
        null,
        2,
      ),
    );
    const operationEmbed = {
      title: `${titleMode} list imported!`,
      description: `${titleMode} statistics:`,
      color: COLORS.orangeHammerHandle,
      fields: [
        {
          name: `Successful ${mode}s`,
          value: `${successList.size}`,
        },
        {
          name: `Failed ${mode}s`,
          value: `${failedList.size}`,
        },
        {
          name: `Unique ${mode}s`,
          value: `${uniqueList.length}`,
        },
        {
          name: `Total ${mode}`,
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
        failedList.size > 0
          ? [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  label: `Unsuccessful ${mode} list link`,
                  style: ButtonStyle.Link,
                  url: await createPaste({
                    content: JSON.stringify(Array.from(failedList), null, 2),
                    title: `[FAILED] ${truncateString(guild.name, 10)} ${titleMode} List`,
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
    if (!settings || !settings.sendImportLog) return;

    const webhook = await this.container.client.fetchWebhook(settings.webhookId);
    if (!webhook) return;

    await webhook.send({
      embeds: [embed],
      components,
    });
  }
}
