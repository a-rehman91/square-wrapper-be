import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    logger.info("HTTP request completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
    });
  });
  next();
};
