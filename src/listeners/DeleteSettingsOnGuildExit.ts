import { ApplyOptions } from "@sapphire/decorators";
import { container, Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import db from "../lib/Database.js";

const PIECE_NAME = "Delete settings on guild exit";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: Events.GuildDelete,
})
export default class UserEvent extends Listener {
  public override run(guild: Guild) {
    void db.servers.remove(guild.id);
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
