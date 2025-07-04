import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import type { APIEmbed } from "discord.js";
import { COLORS } from "../../lib/Constants.js";
import db from "../../lib/Database.js";
import { type BotGuildBanAddOptions, BUEvents } from "../../lib/EventTypes.js";
import { getWebhook } from "../../lib/utils.js";

const PIECE_NAME = "Bot Ban Log";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.BotGuildBanAdd,
})
export default class UserEvent extends Listener<
  typeof BUEvents.BotGuildBanAdd
> {
  public override async run({
    convict,
    executor,
    reason,
  }: BotGuildBanAddOptions) {
    const settings = await db.servers
      .get(executor.guild.id)
      .then((dbDoc) => dbDoc?.data);
    if (!settings?.sendBanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const banEmbed: APIEmbed = {
      title: "**BU Ban Log**",
      color: COLORS.orangeHammerHandle,
      description: `\`${convict.username}\` ${convict} got hit with the swift hammer of justice!\nID: \`${convict.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "**Justice Ban Hammer Wielder**",
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    await webhook.send({
      embeds: [banEmbed],
      username: "BU Ban Log",
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
