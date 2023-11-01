import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { AuditLogEvent, GuildBan, type APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import { getAuditLogData } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit UnBan Log',
  event: Events.GuildBanRemove,
})
export default class UserEvent extends Listener<typeof Events.GuildBanRemove> {
  public override async run(unban: GuildBan) {
    const auditData = await getAuditLogData(AuditLogEvent.MemberBanRemove, unban.guild.id);

    if (!auditData) return;
    if (!auditData.settings.sendBanLog) return;
    if (!auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook } = auditData;

    const firstUnBanLog = auditData.auditLog;

    const { executor } = auditData;
    const reason = unban?.reason || auditData?.reason || 'No reason provided';

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

    await webhook.send({
      embeds: [unBanEmbed],
      username: 'BU Audit Log',
    });
  }
}
