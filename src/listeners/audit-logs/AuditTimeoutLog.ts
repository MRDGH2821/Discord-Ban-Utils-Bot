import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { APIEmbed, AuditLogEvent, Colors, GuildMember, time } from 'discord.js';
import { getAuditLogData } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Timeout Log',
  event: Events.GuildMemberUpdate,
})
export default class UserEvent extends Listener {
  public override async run(oldMember: GuildMember, newMember: GuildMember) {
    const auditData = await getAuditLogData(AuditLogEvent.MemberUpdate, oldMember.guild.id);

    if (!auditData) return;
    if (!auditData.settings.sendTimeoutLog || !auditData.settings.sendUnTimeoutLog) return;
    if (!auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook, executor } = auditData;

    const timeoutDate = newMember.communicationDisabledUntil;

    const timeoutEmbed: APIEmbed = {
      title: '**Audit Timeout Log**',
      description: `\`${newMember.user.username}\` ${newMember.user} has been timed out!\nID: \`${
        newMember.user.id
      }\`\n\nTimeout Date: ${
        timeoutDate ? `${time(timeoutDate, 'F')} (${time(timeoutDate, 'R')})` : 'Unknown'
      }`,
      timestamp: new Date().toISOString(),
      color: Colors.DarkGrey,
    };

    const unTimeoutEmbed: APIEmbed = {
      title: '**Audit UnTimeout Log**',
      description: `\`${newMember.user.username}\` ${newMember.user} is out of timeout!\nID: \`${newMember.user.id}\``,
      timestamp: new Date().toISOString(),
      color: Colors.LightGrey,
    };

    if (executor) {
      timeoutEmbed.fields?.push({
        name: '**Timeout Executor**',
        value: `${executor?.username} ${executor}`,
      });
      unTimeoutEmbed.fields?.push({
        name: '**UnTimeout Executor**',
        value: `${executor?.username} ${executor}`,
      });
    } else {
      timeoutEmbed.fields?.push({
        name: '**Timeout Executor**',
        value: 'Cannot be determined (even from Audit Log)',
      });
      unTimeoutEmbed.fields?.push({
        name: '**UnTimeout Executor**',
        value: 'Cannot be determined (even from Audit Log) or Timeout Expired',
      });
    }

    if (timeoutDate) {
      if (!auditData.settings.sendTimeoutLog) return;
      await webhook.send({
        embeds: [timeoutEmbed],
        username: 'BU Audit Log',
      });
    } else {
      if (!auditData.settings.sendUnTimeoutLog) return;
      await webhook.send({
        embeds: [unTimeoutEmbed],
        username: 'BU Audit Log',
      });
    }
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
