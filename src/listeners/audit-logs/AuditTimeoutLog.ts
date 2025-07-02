import { ApplyOptions } from "@sapphire/decorators";
import { container, Events, Listener } from "@sapphire/framework";
import type { APIEmbed, GuildMember } from "discord.js";
import { AuditLogEvent, Colors, time } from "discord.js";
import { getAuditLogData } from "../../lib/utils";

const PIECE_NAME = "Audit Timeout Log";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: Events.GuildMemberUpdate,
})
export default class UserEvent extends Listener {
  public override async run(oldMember: GuildMember, newMember: GuildMember) {
    const auditData = await getAuditLogData(
      AuditLogEvent.MemberUpdate,
      oldMember.guild.id,
    );

    if (!auditData) return;
    if (
      !auditData.settings.sendTimeoutLog ||
      !auditData.settings.sendUnTimeoutLog
    )
      return;
    if (auditData.isDoneByCmd) return;
    if (!auditData.webhook) return;

    const { webhook, executor } = auditData;

    const timeoutDate = newMember.communicationDisabledUntil;

    const timeoutEmbed: APIEmbed = {
      title: "**Audit Timeout Log**",
      description: `\`${newMember.user.username}\` ${newMember.user} has been timed out!\nID: \`${
        newMember.user.id
      }\`\n\nTimeout Date: ${
        timeoutDate
          ? `${time(timeoutDate, "F")} (${time(timeoutDate, "R")})`
          : "Unknown"
      }`,
      timestamp: new Date().toISOString(),
      color: Colors.DarkGrey,
      fields: [],
    };

    const unTimeoutEmbed: APIEmbed = {
      title: "**Audit UnTimeout Log**",
      description: `\`${newMember.user.username}\` ${newMember.user} is out of timeout!\nID: \`${newMember.user.id}\``,
      timestamp: new Date().toISOString(),
      color: Colors.LightGrey,
      fields: [],
    };

    if (executor) {
      timeoutEmbed.fields?.push({
        name: "**Timeout Executor**",
        value: `${executor?.username} ${executor}`,
      });
      unTimeoutEmbed.fields?.push({
        name: "**UnTimeout Executor**",
        value: `${executor?.username} ${executor}`,
      });
    } else {
      timeoutEmbed.fields?.push({
        name: "**Timeout Executor**",
        value: "Cannot be determined (even from Audit Log)",
      });
      unTimeoutEmbed.fields?.push({
        name: "**UnTimeout Executor**",
        value: "Cannot be determined (even from Audit Log) or Timeout Expired",
      });
    }

    if (timeoutDate) {
      if (!auditData.settings.sendTimeoutLog) return;
      await webhook.send({
        embeds: [timeoutEmbed],
        username: "BU Audit Log",
      });
    } else {
      if (!auditData.settings.sendUnTimeoutLog) return;
      await webhook.send({
        embeds: [unTimeoutEmbed],
        username: "BU Audit Log",
      });
    }
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
