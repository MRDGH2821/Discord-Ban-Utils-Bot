import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import * as colorette from 'colorette';
import '../commands/_load';
import '../listeners/_load';

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Enable colorette
colorette.createColors({ useColor: true });
