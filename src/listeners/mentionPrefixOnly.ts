import { ApplyOptions } from "@sapphire/decorators";
import type { Events } from "@sapphire/framework";
import { container, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

const PIECE_NAME = "Mention Prefix Only";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<
  typeof Events.MentionPrefixOnly
> {
  public async run(message: Message) {
    const prefix = this.container.client.options.defaultPrefix;
    return message.reply(
      prefix
        ? `My prefix in this guild is: \`${prefix}\``
        : "Cannot find any Prefix for Message Commands.",
    );
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
