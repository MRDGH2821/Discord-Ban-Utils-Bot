import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import {
  APIEmbed, GuildMember, time, Webhook,
} from 'discord.js';
import { COLORS } from '../../lib/Constants';
import Database from '../../lib/Database';
import { BotTimeoutOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Bot Timeout Log',
  event: BUEvents.BotTimeout,
})
export default class UserEvent extends Listener {
  public override async run({ convict, executor, reason }: BotTimeoutOptions) {
    const settings = await Database.getSettings(executor.guild.id);
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

      this.sendLog(webhook, executor, description);
    } else {
      const description = `\`${convict.user.username}\` ${convict} is out of timeout!\nID: \`${convict.id}\`\n\nReason: ${reason}`;

      this.sendLog(webhook, executor, description, 'Un');
    }
  }

  public async sendLog(webhook: Webhook, executor: GuildMember, description: string, un = '') {
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

    await webhook.send({
      embeds: [timeoutEmbed],
      username: `**BU ${un}Timeout Log**`,
    });
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
