import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { AuditLogEvent, GuildBan, type APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import { getAuditLogData } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Ban Log',
  event: Events.GuildBanAdd,
})
export default class UserEvent extends Listener<typeof Events.GuildBanAdd> {
  public override async run(ban: GuildBan) {
    const auditData = await getAuditLogData(AuditLogEvent.MemberBanAdd, ban.guild.id);

    if (!auditData) return;
    if (!auditData.settings.sendBanLog) return;
    if (!auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook, executor } = auditData;

    const reason = ban?.reason || auditData?.reason || 'No reason provided';

    const banEmbed: APIEmbed = {
      title: '**Audit Ban Log**',
      color: COLORS.orangeHammerHandle,
      description: `\`${ban.user.username}\` ${ban.user} got hit with the swift hammer of justice!\nID: \`${ban.user.id}\`\n\nReason: ${reason}`,
      timestamp: new Date().toISOString(),
    };

    if (executor) {
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

    await webhook.send({
      embeds: [banEmbed],
      username: 'BU Audit Log',
    });
  }
}
