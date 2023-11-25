import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { APIEmbed, Colors } from 'discord.js';
import { BotSettingsUpdateOptions, BUEvents } from '../../lib/EventTypes';
import { getWebhook } from '../../lib/utils';

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as any;
}
@ApplyOptions<Listener.Options>({
  event: BUEvents.BotSettingsUpdate,
  name: 'Bot Settings Update log',
})
export default class UserEvent extends Listener {
  // eslint-disable-next-line class-methods-use-this
  public emojify(value?: boolean | string) {
    const v = value!!;
    return v ? '✅' : '❌';
  }

  public override async run({ oldSettings, newSettings }: BotSettingsUpdateOptions) {
    const webhook = await getWebhook(newSettings.guildId, newSettings.webhookId);

    if (!webhook) {
      return;
    }
    const { markdownTable } = await import('markdown-table');
    const table = markdownTable([
      ['Setting name', 'Old', 'New'],
      ...entries(newSettings)
        .filter(([, value]) => typeof value === 'boolean')
        .map(([key, value]) => [key, this.emojify(oldSettings![key]), `${value || false}`]),
    ]);

    const embed: APIEmbed = {
      title: '**BU Settings Update Log**',
      description: `Settings updated as follows:\n\n${codeBlock('m', table)}`,
      color: Colors.Green,
      timestamp: new Date().toISOString(),
    };

    webhook.send({
      embeds: [embed],
      username: 'BU Settings Update Log',
    });
  }
}
