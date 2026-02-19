import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

vi.mock("../src/services/catalogService.js", () => ({
  getActiveLocations: vi.fn(async () => [
    {
      id: "loc_1",
      name: "Downtown",
      address: "1 Main St",
      timezone: "America/New_York",
      status: "ACTIVE",
    },
  ]),
  getCatalogByLocation: vi.fn(async (locationId: string) => ({
    locationId,
    categories: [
      {
        id: "sandwiches",
        name: "Sandwiches",
        items: [],
      },
    ],
  })),
  getCategoriesByLocation: vi.fn(async () => [
    { id: "sandwiches", name: "Sandwiches", itemCount: 2 },
  ]),
}));

describe("API routes", () => {
  const app = createApp();

  it("returns active locations", async () => {
    const response = await request(app).get("/api/locations");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("returns catalog for location", async () => {
    const response = await request(app).get("/api/catalog?location_id=loc_1");
    expect(response.status).toBe(200);
    expect(response.body.locationId).toBe("loc_1");
  });

  it("returns categories for location", async () => {
    const response = await request(app).get(
      "/api/catalog/categories?location_id=loc_1",
    );
    expect(response.status).toBe(200);
    expect(response.body[0].itemCount).toBe(2);
  });

  it("returns bad request when location_id missing", async () => {
    const response = await request(app).get("/api/catalog");
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("BAD_REQUEST");
  });
});
