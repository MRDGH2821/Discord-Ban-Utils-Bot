import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { retry, sleepSync, toTitleCase } from '@sapphire/utilities';
import {
  ActionRowBuilder,
  type APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Guild,
  type MessagePayloadOption,
} from 'discord.js';
import { createPaste } from 'dpaste-ts';
import { COLORS } from '../lib/Constants';
import db from '../lib/Database';
import { BUEvents } from '../lib/EventTypes';
import type { BanEntityWithReason, ListImportOptions } from '../lib/typeDefs';
import { fetchAllBans, sequentialPromises, truncateString } from '../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'List Importer',
  event: BUEvents.ListImport,
})
export default class UserEvent extends Listener {
  // eslint-disable-next-line class-methods-use-this
  public async filterList(guildId: string, ignoreExclusionList: boolean) {
    const excData = await db.exclusionList.get(guildId).then((v) => v?.data);
    const list = [];
    if (!ignoreExclusionList && excData && excData.exportExclusion) {
      list.push(...excData.exportExclusion);
    }
    return list;
  }

  public override async run({
    list,
    destinationGuild: guild,
    requesterUser: user,
    sourceMessage: message,
    mode,
    ignoreExclusionList = mode !== 'ban',
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
    const allBans = await fetchAllBans(guild);
    const bansInGuild = new Set(allBans.keys());
    const eList = await this.filterList(guild.id, ignoreExclusionList);

    // this.container.logger.debug(bansInGuild.size);
    const uniqueList = mode === 'ban' ? list.filter((ban) => !bansInGuild.has(ban.id)) : list;
    const filteredList = uniqueList.filter((ban) => !eList.includes(ban.id));

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
            .then(() => successList.add(ban))
            .catch(() => {
              failedList.add(ban);
              return sleepSync(1000);
            }),
        3,
      );

    await sequentialPromises(filteredList, performBan).catch(async (error) =>
      message.reply({
        content: `${user}\nAn error occurred while importing ${mode} list: \n${error}`,
      }),
    );
    this.container.logger.debug(
      `${titleMode} stats:\n`,
      JSON.stringify(
        {
          Server: guild.name,
          Success: successList.size,
          Failed: failedList.size,
          Unique: filteredList.length,
          Total: list.length,
          Mode: mode,
          ExclusionList: ignoreExclusionList ? 'Ignored' : 'Applied',
        },
        null,
        2,
      ),
    );

    let elVerdict = '';

    if (mode === 'ban') {
      elVerdict = ignoreExclusionList
        ? 'Bot will **not** filter the list.\n Thus the excluded people will be banned.'
        : 'Bot will filter the list.\n Thus the excluded people will **not** be banned.';
    } else if (mode === 'unban') {
      elVerdict = ignoreExclusionList
        ? 'Bot will **not** filter the list.\n Thus the excluded people will be unbanned (if they were banned).'
        : 'Bot will filter the list.\n Thus the excluded people will **not** be unbanned (if they were banned).';
    }

    const operationEmbed = EmbedBuilder.from({
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
          value: `${filteredList.length}`,
        },
        {
          name: 'Exclusion List Status',
          value: elVerdict,
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
    });
    void this.sendLog(guild.id, operationEmbed);

    const component = new ActionRowBuilder<ButtonBuilder>();
    if (failedList.size > 0) {
      component.addComponents(
        new ButtonBuilder({
          type: ComponentType.Button,
          label: `Unsuccessful ${mode} list link`,
          style: ButtonStyle.Link,
          url: await createPaste({
            content: JSON.stringify([...failedList], null, 2),
            title: `[FAILED] ${truncateString(guild.name, 10)} ${titleMode} List`,
          }),
        }),
      );
    }
    return message.reply({
      content: `${user}`,
      embeds: [operationEmbed],
      components: [component],
    });
  }

  public async sendLog(
    guildId: Guild['id'],
    embed: APIEmbed | EmbedBuilder,
    components?: MessagePayloadOption['components'] | undefined,
  ) {
    const settings = await db.servers.get(guildId).then((v) => v?.data);
    if (!settings || !settings.sendImportLog) return;

    const webhook = await this.container.client.fetchWebhook(settings.webhookId);
    if (!webhook) return;

    await webhook.send({
      embeds: [embed],
      components: components!,
    });
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
