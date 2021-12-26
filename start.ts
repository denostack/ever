import { readLines } from "https://deno.land/std@0.113.0/io/mod.ts";
import { format } from "https://deno.land/std@0.113.0/datetime/mod.ts";

import { createFileLogger } from './file_logger.ts'

export interface StartOptions {
  permission?: {
    all?: boolean
    net?: boolean
    read?: boolean
    write?: boolean
    env?: boolean
    run?: boolean
  },
  log?: {
    path?: string
  }
}

export async function start(name: string, url: URL, { permission, log }: StartOptions = {}): Promise<number> {
  const application = url.pathname;
  try {
    Deno.lstatSync(application);
  } catch (e) {
    console.log(`${application} not found`);
    return 1;
  }

  const args = []
  {
    const { all, net, read, write, env, run } = permission || {};
    if (all) {
      args.push("-A")
    } else {
      if (net) {
        args.push("--alow-net")
      }
      if (read) {
        args.push("--allow-read")
      }
      if (write) {
        args.push("--allow-write")
      }
      if (env) {
        args.push("--allow-env")
      }
      if (run) {
        args.push("--allow-run")
      }
    }
  }

  const stdoutLogger = createFileLogger({ name: `${name}_stdout`, path: log?.path ?? Deno.cwd() })
  const stderrLogger = createFileLogger({ name: `${name}_stderr`, path: log?.path ?? Deno.cwd() })

  while (true) {
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        ...args,
        application,
      ],
      stdout: "piped",
      stderr: "piped",
    });
  
    (async () => {
      for await (const line of readLines(p.stdout)) {
        stdoutLogger.log(line);
      }
    })();
  
    (async () => {
      for await (const line of readLines(p.stderr)) {
        stderrLogger.log(line);
      }
    })();
  
    const { code } = await p.status();
    if (code === 0) {
      console.log(`[${format(new Date(), "yyyy-MM-dd HH:mm:ss")}] ${name} exited with code ${code}`);
      break
    }
    
    console.log(`[${format(new Date(), "yyyy-MM-dd HH:mm:ss")}] ${name} exited with code ${code}, restarting...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return 0
}
