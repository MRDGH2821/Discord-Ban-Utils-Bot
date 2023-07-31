import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { AuditLogEvent, GuildBan, type APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import Database from '../../lib/Database';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit UnBan Log',
  event: Events.GuildBanRemove,
})
export default class UserEvent extends Listener<typeof Events.GuildBanRemove> {
  public override async run(unban: GuildBan) {
    const settings = await Database.getSettings(unban.guild.id);
    if (!settings || !settings?.sendUnbanLog) {
      return;
    }

    const unbanLogs = await unban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanRemove,
      limit: 1,
    });

    const firstUnBanLog = unbanLogs.entries.first();

    const executor = firstUnBanLog?.executor;
    const reason = unban?.reason || firstUnBanLog?.reason || 'No reason provided';

    const isUnBannedViaCmd = executor?.id === this.container.client.user?.id;
    if (isUnBannedViaCmd) return;

    const unBanEmbed: APIEmbed = {
      title: '**Audit UnBan Log**',
      color: COLORS.hammerHandle,
      description: `\`${unban.user.username}\` ${unban.user} is unbanned!\nID: \`${unban.user.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
    };

    if (firstUnBanLog) {
      unBanEmbed.fields?.push({
        name: '**Justice UnBan Hammer Wielder**',
        value: `${executor?.username} ${executor}`,
      });
    } else {
      unBanEmbed.fields?.push({
        name: '**Justice UnBan Hammer Wielder**',
        value: 'Cannot be determined (even from Audit Log)',
      });
    }

    const webhook = await getWebhook(unban.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    await webhook.send({
      embeds: [unBanEmbed],
      username: 'BU Audit Log',
    });
  }
}
