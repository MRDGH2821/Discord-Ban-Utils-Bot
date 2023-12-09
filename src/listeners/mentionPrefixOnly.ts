import { ApplyOptions } from '@sapphire/decorators';
import type { Events } from '@sapphire/framework';
import { container, Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
  name: 'Mention Prefix Only',
})
export default class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
  public async run(message: Message) {
    const prefix = this.container.client.options.defaultPrefix;
    return message.channel.send(
      prefix
        ? `My prefix in this guild is: \`${prefix}\``
        : 'Cannot find any Prefix for Message Commands.',
    );
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
