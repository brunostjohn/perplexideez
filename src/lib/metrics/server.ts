import { env } from "$env/dynamic/private";
import { createServer, type Server } from "http";
import { parse } from "url";
import { register } from ".";
import { log } from "$lib/log";
import { db } from "$lib/db";

let server: Server | null = null;

export const createMetricsServer = () => {
  const port = parseInt(env.METRICS_PORT ?? "9001", 10);
  log.info({ port }, "Starting metrics server");
  if (server) {
    server.closeAllConnections();
    server.close();
    server = null;
  }

  try {
    server = createServer(async (req, res) => {
      log.trace(req, "Received metrics server request");
      if (!req.url) {
        res.writeHead(404);
        res.end();
        return;
      }
      const route = parse(req.url ?? "").pathname;
      if (route !== "/metrics") {
        res.writeHead(404);
        res.end();
        return;
      }

      res.setHeader("Content-Type", register.contentType);
      const registerMetrics = await register.metrics();
      const prismaMetrics = await db.$metrics.prometheus();
      const allMetrics = registerMetrics + "\n" + prismaMetrics;
      res.end(allMetrics);
      log.trace("Served metrics");
    }).listen(port, "0.0.0.0");

    server.on("error", (error) => {
      log.error(error, "Metrics server error");
    });
  } catch (error) {
    log.error(error, "Failed to start metrics server");
  }

  return server;
};
