import { format } from "https://deno.land/std@0.113.0/datetime/mod.ts";

export interface FileLogger {
  log(data: string): Promise<void>;
  close(): void;
}

export interface CreateFileLoggerOptions {
  name: string;
  path: string;
}

export function createFileLogger(options: CreateFileLoggerOptions): FileLogger {
  const encoder = new TextEncoder();

  let lastFileName = null as string | null;
  let file = null as Deno.File | null;

  let lock = null as Promise<void> | null

  return {
    async log(data: string) {
      if (lock) {
        await lock;
      }
      lock = (async () => {
        const filename = `${options.name}_${format(new Date(), "yyyy-MM-dd")}.log`
  
        if (lastFileName !== filename || !file) {
          lastFileName = filename;
          if (file) {
            file.close();
          }
          await Deno.stat(filename).catch(() => Deno.create(filename));
          file = await Deno.open(filename, {
            write: true,
            append: true,
            create: true,
          });
        }
  
        await file.write(encoder.encode(`[${format(new Date(), "yyyy-MM-dd HH:mm:ss")}] ${data}\n`));

        lock = null
      })()
    },
    close() {
      file?.close();
    },
  };
}
