import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import SettingsCache from '../../lib/Database/Settings/SettingsCache';
import { BotGuildMemberKickOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot Kick Log',
  event: BUEvents.BotGuildMemberKick,
})
export default class UserEvent extends Listener {
  public override async run({ convict, executor, reason }: BotGuildMemberKickOptions) {
    const settings = await SettingsCache.find(executor.guild.id);
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

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
