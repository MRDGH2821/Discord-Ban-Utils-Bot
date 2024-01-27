import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import type { APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import db from '../../lib/Database';
import type { BotGuildMemberKickOptions } from '../../lib/EventTypes';
import { BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot Kick Log',
  event: BUEvents.BotGuildMemberKick,
})
export default class UserEvent extends Listener {
  public override async run({ convict, executor, reason }: BotGuildMemberKickOptions) {
    const settings = await db.servers.get(executor.guild.id).then((v) => v?.data);
    if (!settings || !settings?.sendUnbanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const kickEmbed: APIEmbed = {
      title: '**BU Member Kick Log**',
      color: COLORS.blueGrayBoot,
      description: `\`${convict.user.username}\` ${convict} is kicked with the swiftest boots!\nID: \`${convict.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '**Justice Kick Boots Wielder**',
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    await webhook.send({
      embeds: [kickEmbed],
      username: 'BU Kick Log',
    });
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
