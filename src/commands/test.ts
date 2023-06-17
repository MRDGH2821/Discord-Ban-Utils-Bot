import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'test',
  description: 'An experimental slash command',
  preconditions: ['GuildOnly'],
  requiredUserPermissions: PermissionFlagsBits.Administrator,
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder //
        .setName(this.name)
        .setDescription(this.description),
      {
        guildIds: ['897498649410560032', '897849061980373022'],
      },
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: 'Please use this command inside server',
        flags: MessageFlags.Ephemeral,
      });
    }
    const first5 = await interaction.guild.bans.fetch({ limit: 5 });
    const beforeLastOfFirst5 = await interaction.guild.bans.fetch({
      limit: 5,
      before: first5.lastKey(),
    });
    const afterLastOfFirst5 = await interaction.guild.bans.fetch({
      limit: 5,
      after: first5.lastKey(),
    });

    const beforeFirstOfFirst5 = await interaction.guild.bans.fetch({
      limit: 5,
      before: first5.firstKey(),
    });
    const afterFirstOfFirst5 = await interaction.guild.bans.fetch({
      limit: 5,
      after: first5.firstKey(),
    });

    const formatBans = (bans: typeof first5) => bans.map((ban) => ban.user.id).join('\n');

    return interaction.reply({
      content: `
**First 5**
${formatBans(first5)}

**Before Last of First 5**
${formatBans(beforeLastOfFirst5)}

**After Last of First 5**
${formatBans(afterLastOfFirst5)}

**Before First of First 5**
${formatBans(beforeFirstOfFirst5)}

**After First of First 5**
${formatBans(afterFirstOfFirst5)}
`,
    });
  }
}
