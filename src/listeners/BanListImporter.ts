import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { DurationFormatter } from "@sapphire/time-utilities";
import { retry, sleepSync, toTitleCase } from "@sapphire/utilities";
import { SingleBar } from "cli-progress";
import type { Guild, WebhookMessageCreateOptions } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { createPaste } from "dpaste-ts";
import { COLORS } from "../lib/Constants.js";
import db from "../lib/Database.js";
import { BUEvents } from "../lib/EventTypes.js";
import type {
  BanEntityWithReason,
  ListImportOptions,
} from "../lib/typeDefs.js";
import {
  fetchAllBans,
  sequentialPromises,
  truncateString,
} from "../lib/utils.js";

const bansProgress = new SingleBar({
  format: "Progress | {bar} | {percentage}% | {value}/{total}",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

type ErrorEntity = { banEntity: BanEntityWithReason; error: Error };

const PIECE_NAME = "List Importer";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.ListImport,
})
export default class UserEvent extends Listener {
  #lastMessageUpdateTime = 0;

  public async filterList(guildId: string, shouldIgnoreFilterList: boolean) {
    const excData = await db.filterList
      .get(guildId)
      .then((dbDoc) => dbDoc?.data);
    const list = [];
    if (!shouldIgnoreFilterList && excData?.importFilter) {
      list.push(...excData.importFilter);
    }

    return list;
  }

  private async debounceMessage(func: () => void) {
    const now = Date.now();
    if (now - this.#lastMessageUpdateTime > 10_000) {
      this.#lastMessageUpdateTime = now;
      func();
      return;
    }

    return null;
  }

  public override async run({
    list,
    destinationGuild: guild,
    requesterUser: user,
    sourceMessage: message,
    mode,
    shouldIgnoreFilterList = mode !== "ban",
  }: ListImportOptions) {
    // this.container.logger.debug(JSON.stringify(list));
    const titleMode = toTitleCase(mode);
    const startTime = new Date();
    container.logger.debug(`Starting ${mode}s in:`, guild.name);

    if (list.length === 0) {
      return message.reply({
        content: `No ${mode}s found in the list`,
      });
    }

    const successList = new Set<BanEntityWithReason>();
    const failedList = new Set<BanEntityWithReason>();
    const allBans = await fetchAllBans(guild);
    const bansInGuild = new Set(allBans.keys());
    const ignoreList = await this.filterList(guild.id, shouldIgnoreFilterList);
    const errorList = new Collection<BanEntityWithReason["id"], ErrorEntity>();

    // this.container.logger.debug(bansInGuild.size);
    const uniqueList =
      mode === "ban" ? list.filter((ban) => !bansInGuild.has(ban.id)) : list;
    const filteredList = uniqueList.filter(
      (ban) => !ignoreList.includes(ban.id),
    );

    container.logger.debug("Filtered list size:", filteredList.length);
    bansProgress.setTotal(filteredList.length);

    const banFn = async (id: string, reason: string) =>
      guild.members.ban(id, { reason });
    const unBanFn = async (id: string, reason: string) =>
      guild.members.unban(id, reason);

    const actionFn = mode === "ban" ? banFn : unBanFn;
    bansProgress.start(filteredList.length, 0);
    const performBan = async (ban: BanEntityWithReason) =>
      retry(
        async () =>
          actionFn(
            ban.id,
            ban.reason ??
              `Imported by ${user.username} on ${new Date().toUTCString()}`,
          )
            .then(() => successList.add(ban))
            .then(() => bansProgress.increment())
            .then(async () =>
              this.debounceMessage(async () =>
                message.edit({
                  content: `(${successList.size}/${filteredList.length - failedList.size})`,
                }),
              ),
            )
            .catch((error) => {
              failedList.add(ban);
              errorList.set(ban.id, { banEntity: ban, error });
              sleepSync(1_000);
            }),
        3,
      );

    container.logger.debug("Starting bans...\n");
    await sequentialPromises(filteredList, performBan)
      .then(() => bansProgress.stop())
      .then(async () => message.edit({ content: "Bans completed!" }))
      .catch(async (error) =>
        message.reply({
          content: `${user}\nAn error occurred while importing ${mode} list: \n${error}`,
        }),
      );
    const endTime = new Date();
    const timeTaken = endTime.getTime() - startTime.getTime();
    container.logger.debug(
      `\n${titleMode} stats:\n`,
      JSON.stringify(
        {
          Server: guild.name,
          Success: successList.size,
          Failed: failedList.size,
          Unique: filteredList.length,
          Total: list.length,
          Mode: mode,
          FilterList: shouldIgnoreFilterList ? "Ignored" : "Applied",
        },
        null,
        2,
      ),
    );

    let elVerdict = "";

    if (mode === "ban") {
      elVerdict = shouldIgnoreFilterList
        ? "Bot will **not** filter the list.\n Thus the excluded people will be banned."
        : "Bot will filter the list.\n Thus the excluded people will **not** be banned.";
    } else if (mode === "unban") {
      elVerdict = shouldIgnoreFilterList
        ? "Bot will **not** filter the list.\n Thus the excluded people will be unbanned (if they were banned)."
        : "Bot will filter the list.\n Thus the excluded people will **not** be unbanned (if they were banned).";
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
          name: "Filter List Status",
          value: elVerdict,
        },
        {
          name: `Total ${mode}`,
          value: `${list.length}`,
        },
        {
          name: "Time Taken",
          value: new DurationFormatter().format(timeTaken),
        },
      ],
      footer: {
        text: `Requested by ${user.username}`,
        icon_url: user.displayAvatarURL(),
      },
    });

    const component = new ActionRowBuilder<ButtonBuilder>();
    if (failedList.size > 0) {
      const failedListLink = await createPaste({
        content: JSON.stringify([...failedList], null, 2),
        title: `[FAILED] ${truncateString(guild.name, 10)} ${titleMode} List`,
      });
      component.addComponents(
        new ButtonBuilder({
          type: ComponentType.Button,
          label: `Unsuccessful ${mode} list link`,
          style: ButtonStyle.Link,
          url: failedListLink,
        }),
      );
      operationEmbed.addFields([
        { name: "Link of list of failed bans", value: failedListLink },
      ]);
    }

    component.addComponents(
      new ButtonBuilder({
        type: ComponentType.Button,
        label: "Jump to OG msg.",
        style: ButtonStyle.Link,
        url: message.url,
      }),
    );

    void this.sendLog(guild.id, {
      embeds: [operationEmbed],
      components: [component],
      files:
        failedList.size > 0
          ? [
              {
                name: "failed_bans.json",
                attachment: Buffer.from(
                  JSON.stringify(errorList.toJSON(), null, 2),
                ),
              },
            ]
          : [],
    });
    return message.reply({
      content: `${user}`,
      embeds: [operationEmbed],
      components: [component],
    });
  }

  public async sendLog(
    guildId: Guild["id"],
    webhookOptions: WebhookMessageCreateOptions,
  ) {
    const settings = await db.servers.get(guildId).then((dbDoc) => dbDoc?.data);
    if (!settings?.sendImportLog) return;

    const webhook = await this.container.client.fetchWebhook(
      settings.webhookId,
    );
    if (!webhook) return;

    await webhook.send(webhookOptions);
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
