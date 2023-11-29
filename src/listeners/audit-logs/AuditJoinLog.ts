import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { APIEmbed, GuildMember, time } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import SettingsCache from '../../lib/Database/Settings/SettingsCache';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Join Log',
  event: Events.GuildMemberAdd,
})
export default class UserEvent extends Listener<typeof Events.GuildMemberAdd> {
  public override async run(member: GuildMember) {
    const settings = await SettingsCache.getSettings(member.guild.id);
    if (!settings || !settings?.sendJoinLog) {
      return;
    }

    const webhook = await getWebhook(member.guild.id, settings.webhookId);
    if (!webhook) {
      return;
    }

    const ageStamp = member.user.createdTimestamp;

    const ageDifference = Date.now() - ageStamp;

    const ageEmbed: APIEmbed = {
      title: '**Audit Join Log**',
      color: COLORS.yellowWarning,
      description: `${member.user.tag} \`${
        member.user.username
      }\` joined the server. \nAccount Created: ${time(ageStamp, 'F')} (${time(ageStamp, 'R')})\n${
        ageDifference < Time.Week ? '**WARNING:** Account is less than 7 days old!' : ''
      }`,
      timestamp: new Date().toISOString(),
    };
    await webhook.send({
      embeds: [ageEmbed],
      username: 'BU Audit Log',
    });
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
