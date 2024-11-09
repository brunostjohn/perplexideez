import { collectDefaultMetrics, Registry } from "prom-client";

export const register = new Registry();
collectDefaultMetrics({ register });
