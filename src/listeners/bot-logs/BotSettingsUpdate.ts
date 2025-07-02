import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { codeBlock } from "@sapphire/utilities";
import type { APIEmbed } from "discord.js";
import { Colors } from "discord.js";
import type { BotSettingsUpdateOptions } from "../../lib/EventTypes";
import { BUEvents } from "../../lib/EventTypes";
import { getWebhook } from "../../lib/utils";

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
const PIECE_NAME = "Bot Settings Update log";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.BotSettingsUpdate,
})
export default class UserEvent extends Listener {
  // eslint-disable-next-line class-methods-use-this
  public emojify(value?: boolean | string | null) {
    const v = value!;
    return v ? "✅" : "❌";
  }

  public override async run({
    oldSettings,
    newSettings,
  }: BotSettingsUpdateOptions) {
    const webhook = await getWebhook(
      newSettings.guildId,
      newSettings.webhookId,
    );

    if (!webhook) {
      return;
    }
    const { markdownTable } = await import("markdown-table");
    const table = markdownTable([
      ["Setting name", "Old", "New"],
      ...entries(newSettings)
        .filter(([, value]) => typeof value === "boolean")
        .map(([key, value]) => [
          key,
          this.emojify(oldSettings![key]),
          `${value || false}`,
        ]),
    ]);

    const embed: APIEmbed = {
      title: "**BU Settings Update Log**",
      description: `Settings updated as follows:\n\n${codeBlock("m", table)}`,
      color: Colors.Green,
      timestamp: new Date().toISOString(),
    };

    void webhook.send({
      embeds: [embed],
      username: "BU Settings Update Log",
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
