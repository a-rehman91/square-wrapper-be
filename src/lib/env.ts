import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "sandbox",
  port: Number(process.env.PORT ?? 4000),
  squareToken: process.env.SQUARE_ACCESS_TOKEN ?? "",
  squareEnvironment: (process.env.SQUARE_ENVIRONMENT ?? "sandbox") as
    | "sandbox"
    | "production",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 120),
};
