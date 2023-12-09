import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { Guild } from 'discord.js';
import SettingsCache from '../lib/Database/Settings/SettingsCache';

@ApplyOptions<Listener.Options>({
  name: 'Delete settings on guild exit',
  event: Events.GuildDelete,
})
export default class UserEvent extends Listener {
  public override run(guild: Guild) {
    return SettingsCache.deleteSetting(guild.id);
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
