import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { AuditLogEvent, GuildMember, type APIEmbed } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import Database from '../../lib/Database';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Exit Log',
  event: Events.GuildMemberRemove,
})
export default class UserEvent extends Listener<typeof Events.GuildMemberRemove> {
  public override async run(member: GuildMember) {
    const settings = await Database.getSettings(member.guild.id);
    if (!settings || !settings?.sendExitLog) {
      return;
    }

    const exitLogs = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberKick,
      limit: 1,
    });

    const firstExitLog = exitLogs.entries.first();

    const executor = firstExitLog?.executor;

    const isKickedViaCmd = executor?.id === this.container.client.user?.id;
    if (isKickedViaCmd) return;

    const exitEmbed: APIEmbed = {
      title: '**Audit Exit Log**',
      color: COLORS.wrenchHandle,
      description: `\`${member.user.username}\` ${member.user} exitted this server\nID: \`${member.user.id}\`\n`,
      timestamp: new Date().toISOString(),
    };

    const webhook = await getWebhook(member.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    await webhook.send({
      embeds: [exitEmbed],
      username: 'BU Audit Log',
    });
  }
}
