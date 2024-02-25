// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-restricted-syntax */
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember, PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';
import type { Snowflake } from 'discord.js';
import { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { COLORS } from '../lib/Constants';
import { formatCmdName, sequentialPromises } from '../lib/utils';

const PIECE_NAME = 'help';
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: 'Provides help for commands',
  detailedDescription: {
    help: 'Provides detailed description of commands with other necessary info.\nSome commands require extra permissions and the emojis will tell if it is granted or not.\n✅ = Permission granted to you/bot\n❌ = Permission denied to you/bot',
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
          required: false,
          autocomplete: true,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const cmd = interaction.options.getFocused();
    const commands = await interaction.client.application.commands.fetch();

    const commandsList = commands.filter((command) =>
      command.name.toLowerCase().includes(cmd.toLowerCase()),
    );

    return interaction.respond(
      commandsList.map((command) => ({
        name: command.name,
        value: command.id,
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
    await interaction.deferReply();
    const cmdId = interaction.options.getString('command');
    if (cmdId) {
      return interaction.editReply({
        embeds: [await this.singleCommandHelp(cmdId, interaction)],
      });
    }

    const cmdIds = (await interaction.client.application.commands.fetch()).map((cmd) => cmd.id);
    const helpEmbed = (commandId: Snowflake) => this.singleCommandHelp(commandId, interaction);
    const paginatedEmbeds = new PaginatedMessage();

    return sequentialPromises(cmdIds, helpEmbed)
      .then((embeds) =>
        sequentialPromises(embeds, async (embed) => paginatedEmbeds.addAsyncPageEmbed(embed)),
      )
      .then(() => paginatedEmbeds.run(interaction));
  }

  public async singleCommandHelp(
    cmdId: Snowflake,
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const cmd = await interaction.client.application.commands.fetch(cmdId);
    const command = this.container.stores.get('commands').get(cmd.name);

    if (!command) throw new Error(`Command with id: ${cmdId} not found`);

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

    const embed = new EmbedBuilder()
      .setTitle(formatCmdName(command.name, cmdId))
      .setDescription(command.description)
      .setColor(COLORS.charcoalInvisible)
      .addFields([
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
      ]);

    const { subcommands } = command.detailedDescription;
    if (subcommands) {
      const subCommandText = subcommands?.map((subcommand) => {
        const subName = subcommand.name;
        const { group } = subcommand;
        const formattedCmdName = formatCmdName(command.name, cmdId, subName, group);
        return `${formattedCmdName}\n${subcommand.description}\n${subcommand.help}`;
      });
      embed.addFields({
        name: 'Subcommands',
        value: subCommandText.join('\n\n'),
      });
    }

    return embed;
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
