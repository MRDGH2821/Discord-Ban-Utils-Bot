import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import type { APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import Database from '../../lib/Database';
import { type BotGuildBanAddOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot Ban Log',
  event: BUEvents.BotGuildBanAdd,
})
export default class UserEvent extends Listener<typeof BUEvents.BotGuildBanAdd> {
  public override async run({ convict, executor, reason }: BotGuildBanAddOptions) {
    const settings = await Database.getSettings(executor.guild.id);
    if (!settings || !settings?.sendBanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const banEmbed: APIEmbed = {
      title: '**BU Ban Log**',
      color: COLORS.orangeHammerHandle,
      description: `\`${convict.username}\` ${convict} got hit with the swift hammer of justice!\nID: \`${convict.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '**Justice Ban Hammer Wielder**',
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    await webhook.send({
      embeds: [banEmbed],
      username: 'BU Ban Log',
    });
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
