// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-restricted-syntax */
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';
import { APIEmbed, ApplicationCommandOptionType, PermissionsBitField } from 'discord.js';
import { COLORS } from '../lib/Constants';

@ApplyOptions<Command.Options>({
  name: 'help',
  description: 'Provides help for commands',
  detailedDescription: {
    help: 'Provides detailed description of commands with other necessary info',
  },
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'command',
          description: 'Put command name to see its detailed description',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const cmd = interaction.options.getFocused();

    const commandsList = this.container.stores
      .get('commands')
      .map((command) => command.name)
      .filter((command) => command.toLowerCase().includes(cmd.toLowerCase()));

    return interaction.respond(
      commandsList.map((cmdName) => ({
        name: cmdName,
        value: cmdName,
      })),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public permissionsStatus(
    requiredPermissions?: PermissionsBitField,
    availablePermissions?: Readonly<PermissionsBitField>,
  ) {
    let text = '';

    if (!requiredPermissions || requiredPermissions.toArray().length <= 0) return 'None';

    if (availablePermissions && availablePermissions.toArray().length > 0) {
      for (const permission of requiredPermissions) {
        text += requiredPermissions.has(permission) ? `${permission} ✅\n` : `${permission} ❌\n`;
      }
    } else {
      for (const permission of requiredPermissions) {
        text += `${permission} ❌\n`;
      }
    }

    return text;
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const cmdName = interaction.options.getString('command', true);

    const command = this.container.stores.get('commands').get(cmdName);

    if (!command) return interaction.reply({ content: 'Command not found', ephemeral: true });

    const requiredBotPermissions = new PermissionsBitField(
      command.options.requiredClientPermissions,
    );
    const requiredUserPermissions = new PermissionsBitField(
      command.options.requiredUserPermissions,
    );

    const me = await interaction.guild?.members.fetchMe();

    const availablePermissionsToBot = me?.permissions;

    const availablePermissionsToUser = isGuildMember(interaction.member)
      ? interaction.member.permissions
      : undefined;

    const embed: APIEmbed = {
      title: command.name,
      description: command.description,
      color: COLORS.charcoalInvisible,
      fields: [
        {
          name: 'Detailed description',
          value: command.detailedDescription?.help ?? 'None',
        },
        {
          name: 'Permissions required by bot & status',
          value: this.permissionsStatus(requiredBotPermissions, availablePermissionsToBot),
        },
        {
          name: 'Required user permissions & status',
          value: this.permissionsStatus(requiredUserPermissions, availablePermissionsToUser),
        },
      ],
    };

    return interaction.reply({ embeds: [embed] });
  }
}

void container.stores.loadPiece({
  name: UserCommand.name,
  piece: UserCommand,
  store: 'commands',
});
