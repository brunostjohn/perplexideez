import { env } from "$env/dynamic/private";
import pino from "pino";

export const log = pino(
  import.meta.env.DEV
    ? {
        level: "trace",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: true,
          },
        },
      }
    : {
        level: env.LOG_LEVEL ?? "info",
        formatters: {
          level: (label) => ({ level: label.toLowerCase() }),
        },
      }
);
