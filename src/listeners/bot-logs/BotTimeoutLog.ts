import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { APIEmbed, GuildMember, time, Webhook } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import SettingsCache from '../../lib/Database/Settings/SettingsCache';
import { BotTimeoutOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot Timeout Log',
  event: BUEvents.BotTimeout,
})
export default class UserEvent extends Listener {
  public override async run({ convict, executor, reason }: BotTimeoutOptions) {
    const settings = await SettingsCache.find(executor.guild.id);
    if (!settings || !settings?.sendBanLog) {
      return;
    }

    const webhook = await getWebhook(executor.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const { communicationDisabledUntil } = convict;

    if (communicationDisabledUntil) {
      const description = `\`${convict.user.username}\` ${convict} is under timeout!\nID: \`${
        convict.id
      }\`\nIn timeout until: ${time(communicationDisabledUntil)} (${time(
        communicationDisabledUntil,
        'R',
      )})\n\nReason: ${reason}`;

      this.sendLog(webhook, executor, description).catch((error) =>
        this.container.logger.error(error),
      );
    } else {
      const description = `\`${convict.user.username}\` ${convict} is out of timeout!\nID: \`${convict.id}\`\n\nReason: ${reason}`;

      this.sendLog(webhook, executor, description, 'Un').catch((error) =>
        this.container.logger.error(error),
      );
    }
  }

  public sendLog(webhook: Webhook, executor: GuildMember, description: string, un = '') {
    const timeoutEmbed: APIEmbed = {
      title: `**BU ${un}Timeout Log**`,
      color: COLORS.orangeHammerHandle,
      description,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: `**Justice ${un}Timeout Clock Wielder**`,
          value: `${executor.user.username} ${executor}`,
        },
      ],
    };

    return webhook.send({
      embeds: [timeoutEmbed],
      username: `**BU ${un}Timeout Log**`,
    });
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
