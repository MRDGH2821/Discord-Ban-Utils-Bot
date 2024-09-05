import '@sapphire/plugin-logger/register';
import '../commands/_load';
import '../listeners/_load';
import '../healthInfo';
import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Enable colorette
colorette.createColors({ useColor: true });
declare module '@sapphire/framework' {
  //  @ts-expect-error This is module override
  export interface DetailedDescriptionCommand {
    help: string;
    subcommands?: {
      name: string;
      description: string;
      help: string;
      group?: string;
    }[];
  }
}
