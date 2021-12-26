import { Args, parse } from "https://deno.land/std@0.113.0/flags/mod.ts";
import { start } from "../start.ts"

export const name = "run";

export const description = "Run a program";

export const help = `ever ${name} [file]
${description}

Usage:
  ever ${name} ./yourapp.ts

Options:
`;

export async function execute(args: Args): Promise<number> {
  const filename = `${args._.shift() ?? ""}`;
  const appname = filename.split('/').pop() ?? 'app';

  return await start(appname, new URL(filename, `file://${Deno.cwd()}/`), { permission: { all: true }})
}

if (import.meta.main) {
  await execute(parse(Deno.args));
}
