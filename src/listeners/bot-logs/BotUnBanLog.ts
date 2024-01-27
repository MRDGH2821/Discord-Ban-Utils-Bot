import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import db from '../../lib/Database';
import { BotGuildBanRemoveOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot UnBan Log',
  event: BUEvents.BotGuildBanRemove,
})
export default class UserEvent extends Listener {
  public override async run({ convict, executor, reason }: BotGuildBanRemoveOptions) {
    const settings = await db.servers.get(executor.guild.id).then((v) => v?.data);
    if (!settings || !settings?.sendUnbanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const unbanEmbed: APIEmbed = {
      title: '**BU Unban Log**',
      color: COLORS.orangeHammerHandle,
      description: `\`${convict.username}\` ${convict} got unbanned!\nID: \`${convict.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '**Justice UnBan Hammer Wielder**',
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    await webhook.send({
      embeds: [unbanEmbed],
      username: 'BU Unban Log',
    });
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
