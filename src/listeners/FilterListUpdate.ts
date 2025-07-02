import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { userMention } from "discord.js";
import { COLORS, DUMMY_USER_ID } from "../lib/Constants";
import db from "../lib/Database";
import type { FilterListUpdateOptions } from "../lib/EventTypes";
import { BUEvents } from "../lib/EventTypes";
import { debugErrorEmbed, debugErrorFile } from "../lib/utils";

const PIECE_NAME = "Update Filter List";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.FilterListUpdate,
})
export default class UserEvent extends Listener {
  public override run(payload: FilterListUpdateOptions) {
    this.container.logger.debug("Updating Filter list:", payload);
    const { mode } = payload;

    db.filterList
      .upset(payload.guildId, ($) => {
        const func = mode === "add" ? $.arrayUnion : $.arrayRemove;
        return {
          guildId: payload.guildId,
          exportFilter: func(payload.exportFilter),
          importFilter: func(payload.importFilter),
        };
      })
      .then((val) => val.get())
      .then((val) => {
        const { exportFilter, importFilter } = val!.data;
        const exportFilterList = exportFilter
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(", ");
        const importFilterList = importFilter
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(", ");

        return payload.interaction.editReply({
          embeds: [
            {
              title: "**List Updated!**",
              color: COLORS.charcoalInvisible,
              description: "List Updated Successfully!",
              fields: [
                {
                  name: "Export Filter List",
                  value: exportFilterList || "None",
                },
                {
                  name: "Import Filter List",
                  value: importFilterList || "None",
                },
              ],
            },
          ],
        });
      })
      .catch((error) => {
        this.container.logger.error(error);
        const { interaction } = payload;
        return interaction.editReply({
          embeds: [
            debugErrorEmbed({
              checks: [
                {
                  question: "Can you ban members or manage the server?",
                  result:
                    interaction.memberPermissions?.has("BanMembers") ||
                    interaction.memberPermissions?.has("ManageGuild") ||
                    false,
                },
              ],
              description: "Unable to update the filter list",
              error,
              inputs: [
                {
                  name: "Mode",
                  value: payload.mode,
                },
                {
                  name: "User IDs",
                  value: [...payload.exportFilter]
                    .concat(payload.importFilter)
                    .flat()
                    .join(", "),
                },
              ],
              solution:
                "Please check if you have the required permissions and try again. Else wait for some time.",
              title: "Filter List Update Failed",
            }),
          ],
          files: [debugErrorFile(error)],
        });
      });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
