type LogLevel = "debug" | "info" | "warn" | "error";

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveMinLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL;
  if (
    configured === "debug" ||
    configured === "info" ||
    configured === "warn" ||
    configured === "error"
  ) {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const minLevel = resolveMinLevel();

function shouldLog(level: LogLevel): boolean {
  return levelWeight[level] >= levelWeight[minLevel];
}

function serializeMeta(meta?: Record<string, unknown>): string {
  if (!meta) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [unserializable-meta]";
  }
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${serializeMeta(meta)}`;
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    log("debug", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>) {
    log("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    log("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>) {
    log("error", message, meta);
  },
};
