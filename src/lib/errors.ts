import type { ApiErrorResponse } from "../types/api.js";

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: string[];

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: string[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function toApiError(error: unknown): {
  statusCode: number;
  body: ApiErrorResponse;
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  };
}
