import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import type { StringSelectMenuInteraction } from 'discord.js';
import type { SettingsOptions, SettingsParameter } from '../lib/typeDefs';

const selectedSettingsValidator = s
  .array(
    s.enum<SettingsParameter>(
      'sendBanLog',
      'sendUnbanLog',
      'sendExitLog',
      'sendJoinLog',
      'sendKickLog',
      'sendTimeoutLog',
      'sendUnTimeoutLog',
      'sendBanImportLog',
      'sendBanExportLog',
      'sendBanCopyLog',
      'sendMassBanLog',
      'sendMassUnbanLog',
    ),
  )
  .transform((values) => values.reduce<SettingsOptions>((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {}));

@ApplyOptions<InteractionHandler.Options>({
  name: 'Settings Menu Handler',
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export default class MenuHandler extends InteractionHandler {
  public override async run(interaction: StringSelectMenuInteraction) {
    const parsedSettings = selectedSettingsValidator.parse(interaction.values);

    this.container.logger.debug(parsedSettings);

    // TODO: let user know what settings selected, confirm it, and then update the settings
  }

  public override parse(interaction: StringSelectMenuInteraction) {
    if (interaction.customId !== 'selected-settings') return this.none();

    return this.some();
  }
}
