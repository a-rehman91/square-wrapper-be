import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

app.listen(env.port, () => {
  logger.info("API server started", {
    port: env.port,
    nodeEnv: env.nodeEnv,
    squareEnvironment: env.squareEnvironment,
  });
});
