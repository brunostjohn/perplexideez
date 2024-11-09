import { env } from "$env/dynamic/private";
import { createServer, type Server } from "http";
import { parse } from "url";
import { register } from ".";
import { log } from "$lib/log";

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
      res.end(await register.metrics());
      log.trace("Served metrics");
    }).listen(port, "0.0.0.0");
  } catch (error) {
    log.error(error, "Failed to start metrics server");
  }

  return server;
};
