import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { toApiError } from "./lib/errors.js";
import { logger } from "./lib/logger.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", apiRouter);

  app.use(
    (
      error: unknown,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const mapped = toApiError(error);
      logger.error("Unhandled route error", {
        method: req.method,
        path: req.path,
        statusCode: mapped.statusCode,
        code: mapped.body.code,
        message: mapped.body.message,
        details: mapped.body.details,
        rawError:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      });
      res.status(mapped.statusCode).json(mapped.body);
    },
  );

  return app;
}
