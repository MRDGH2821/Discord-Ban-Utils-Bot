import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { type APIEmbed, AuditLogEvent, GuildBan } from 'discord.js';
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
    if (!auditData.settings.sendUnbanLog) return;
    if (auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook, executor } = auditData;

    const reason = unban?.reason || auditData?.reason || 'No reason provided';

    const unBanEmbed: APIEmbed = {
      title: '**Audit UnBan Log**',
      color: COLORS.orangeHammerHandle,
      description: `\`${unban.user.username}\` ${unban.user} is unbanned!\nID: \`${unban.user.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
      fields: [],
    };

    if (executor) {
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

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
