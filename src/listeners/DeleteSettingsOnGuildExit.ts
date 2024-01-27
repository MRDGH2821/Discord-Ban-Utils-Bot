import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import db from '../lib/Database';

@ApplyOptions<Listener.Options>({
  name: 'Delete settings on guild exit',
  event: Events.GuildDelete,
})
export default class UserEvent extends Listener {
  public override run(guild: Guild) {
    void db.servers.remove(guild.id);
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
