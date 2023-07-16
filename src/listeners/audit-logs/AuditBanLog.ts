import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { AuditLogEvent, GuildBan, type APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import Database from '../../lib/Database';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Ban Log',
  event: Events.GuildBanAdd,
})
export default class UserEvent extends Listener<typeof Events.GuildBanAdd> {
  public override async run(ban: GuildBan) {
    const settings = await Database.getSettings(ban.guild.id);
    if (!settings || !settings?.sendBanLog) {
      return;
    }

    const banLogs = await ban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      limit: 1,
    });

    const firstBanLog = banLogs.entries.first();

    const executor = firstBanLog?.executor;
    const reason = ban?.reason || firstBanLog?.reason || 'No reason provided';

    const isBannedViaCmd = executor?.id === this.container.client.user?.id;
    if (isBannedViaCmd) return;

    const banEmbed: APIEmbed = {
      title: '**Audit Ban Log**',
      color: COLORS.hammerHandle,
      description: `\`${ban.user.username}\` ${ban.user} got hit with the swift hammer of justice!\nID: \`${ban.user.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
    };

    if (firstBanLog) {
      banEmbed.fields?.push({
        name: '**Justice Ban Hammer Wielder**',
        value: `${executor?.username} ${executor}`,
      });
    } else {
      banEmbed.fields?.push({
        name: '**Justice Ban Hammer Wielder**',
        value: 'Cannot be determined (even from Audit Log)',
      });
    }

    const webhook = await getWebhook(ban.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    await webhook.send({
      embeds: [banEmbed],
      username: 'BU Audit Log',
    });
  }
}
