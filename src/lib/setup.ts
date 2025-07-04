import "@sapphire/plugin-logger/register";
import "../commands/_load.js";
import "../listeners/_load.js";
import "../healthInfo.js";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import * as colorette from "colorette";

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

// Enable colorette
colorette.createColors({ useColor: true });
declare module "@sapphire/framework" {
  //  @ts-expect-error This is module override
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface DetailedDescriptionCommand {
    help: string;
    subcommands?: {
      description: string;
      group?: string;
      help: string;
      name: string;
    }[];
  }
}
