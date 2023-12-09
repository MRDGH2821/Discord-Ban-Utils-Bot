import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { type APIEmbed, AuditLogEvent, GuildMember } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import { getAuditLogData } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Exit Log',
  event: Events.GuildMemberRemove,
})
export default class UserEvent extends Listener<typeof Events.GuildMemberRemove> {
  public override async run(member: GuildMember) {
    const auditData = await getAuditLogData(AuditLogEvent.MemberKick, member.guild.id);

    if (!auditData) return;
    if (!auditData.settings.sendExitLog) return;
    if (auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook } = auditData;

    const firstExitLog = auditData.auditLog;

    const reason = firstExitLog?.reason || '';

    const exitEmbed: APIEmbed = {
      title: '**Audit Exit Log**',
      color: COLORS.blueGrayBoot,
      description: `\`${member.user.username}\` ${member.user} exitted this server\nID: \`${member.user.id}\`\n${reason}`,
      timestamp: new Date().toISOString(),
    };

    await webhook.send({
      embeds: [exitEmbed],
      username: 'BU Audit Log',
    });
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
