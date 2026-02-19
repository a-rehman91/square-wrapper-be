import { describe, expect, it } from "vitest";
import { AppError, toApiError } from "../src/lib/errors.js";

describe("toApiError", () => {
  it("maps AppError into structured response", () => {
    const err = new AppError("Square failed", 502, "SQUARE_API_ERROR", [
      "Timeout",
    ]);

    const mapped = toApiError(err);
    expect(mapped.statusCode).toBe(502);
    expect(mapped.body.code).toBe("SQUARE_API_ERROR");
    expect(mapped.body.details).toEqual(["Timeout"]);
  });

  it("maps unknown errors to internal error", () => {
    const mapped = toApiError(new Error("oops"));
    expect(mapped.statusCode).toBe(500);
    expect(mapped.body.code).toBe("INTERNAL_ERROR");
  });
});
