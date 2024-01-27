import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { APIEmbed, GuildMember, time } from 'discord.js';
import { COLORS } from '../../lib/Constants';
import db from '../../lib/Database';
import { getWebhook } from '../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Audit Join Log',
  event: Events.GuildMemberAdd,
})
export default class UserEvent extends Listener<typeof Events.GuildMemberAdd> {
  public override async run(member: GuildMember) {
    const settings = await db.servers.get(member.guild.id).then((v) => v?.data);
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
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

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
