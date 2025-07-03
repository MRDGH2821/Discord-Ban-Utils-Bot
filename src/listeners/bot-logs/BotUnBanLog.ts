import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import type { APIEmbed } from "discord.js";
import { COLORS } from "../../lib/Constants.js";
import db from "../../lib/Database.js";
import type { BotGuildBanRemoveOptions } from "../../lib/EventTypes.js";
import { BUEvents } from "../../lib/EventTypes.js";
import { getWebhook } from "../../lib/utils.js";

const PIECE_NAME = "Bot UnBan Log";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.BotGuildBanRemove,
})
export default class UserEvent extends Listener {
  public override async run({
    convict,
    executor,
    reason,
  }: BotGuildBanRemoveOptions) {
    const settings = await db.servers
      .get(executor.guild.id)
      .then((v) => v?.data);
    if (!settings || !settings?.sendUnbanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const unbanEmbed: APIEmbed = {
      title: "**BU Unban Log**",
      color: COLORS.orangeHammerHandle,
      description: `\`${convict.username}\` ${convict} got unbanned!\nID: \`${convict.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "**Justice UnBan Hammer Wielder**",
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    await webhook.send({
      embeds: [unbanEmbed],
      username: "BU Unban Log",
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
