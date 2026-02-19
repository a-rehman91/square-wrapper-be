import { Router } from "express";
import { AppError } from "../lib/errors.js";
import { cacheStore } from "../lib/cache.js";
import {
  getActiveLocations,
  getCatalogByLocation,
  getCategoriesByLocation,
} from "../services/catalogService.js";

export const apiRouter = Router();

apiRouter.get("/locations", async (_req, res, next) => {
  try {
    const cacheKey = "locations:active";
    const cached = cacheStore.get<unknown[]>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const locations = await getActiveLocations();
    cacheStore.set(cacheKey, locations);
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

function getLocationId(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("Query param location_id is required", 400, "BAD_REQUEST");
  }
  return value.trim();
}

apiRouter.get("/catalog", async (req, res, next) => {
  try {
    const locationId = getLocationId(req.query.location_id);
    const cacheKey = `catalog:${locationId}`;
    const cached = cacheStore.get<unknown>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const catalog = await getCatalogByLocation(locationId);
    cacheStore.set(cacheKey, catalog);
    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/catalog/categories", async (req, res, next) => {
  try {
    const locationId = getLocationId(req.query.location_id);
    const cacheKey = `catalog:categories:${locationId}`;
    const cached = cacheStore.get<unknown>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const categories = await getCategoriesByLocation(locationId);
    cacheStore.set(cacheKey, categories);
    res.json(categories);
  } catch (error) {
    next(error);
  }
});
