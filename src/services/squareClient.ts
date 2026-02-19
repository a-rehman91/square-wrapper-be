import { AppError } from "../lib/errors.js";
import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";

const baseUrl =
  env.squareEnvironment === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

interface SquareError {
  category?: string;
  code?: string;
  detail?: string;
}

interface SquareErrorResponse {
  errors?: SquareError[];
}

export interface SquareLocation {
  id?: string;
  name?: string;
  status?: "ACTIVE" | "INACTIVE";
  timezone?: string;
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface SquareCatalogObject {
  id: string;
  type: "ITEM" | "CATEGORY" | "IMAGE" | "ITEM_VARIATION" | string;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  item_data?: {
    name?: string;
    description?: string;
    category_id?: string;
    image_ids?: string[];
    variations?: SquareCatalogObject[];
  };
  category_data?: {
    name?: string;
  };
  image_data?: {
    url?: string;
  };
  item_variation_data?: {
    name?: string;
    price_money?: { amount?: number };
  };
}

interface LocationsResponse {
  locations?: SquareLocation[];
}

interface SearchCatalogResponse {
  objects?: SquareCatalogObject[];
  related_objects?: SquareCatalogObject[];
  cursor?: string;
}

async function squareRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!env.squareToken) {
    throw new AppError(
      "Server is missing SQUARE_ACCESS_TOKEN configuration",
      500,
      "CONFIG_ERROR",
    );
  }

  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.squareToken}`,
      "Square-Version": "2025-01-23",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  logger.debug("Square API request completed", {
    method: init.method ?? "GET",
    path,
    statusCode: response.status,
    durationMs: Date.now() - startedAt,
  });

  if (!response.ok) {
    let parsed: SquareErrorResponse | null = null;
    try {
      parsed = (await response.json()) as SquareErrorResponse;
    } catch {
      parsed = null;
    }

    const details = parsed?.errors?.map((err) => err.detail ?? "Unknown error");
    logger.warn("Square API request failed", {
      method: init.method ?? "GET",
      path,
      statusCode: response.status,
      details,
    });
    throw new AppError(
      "Square API request failed",
      response.status,
      "SQUARE_API_ERROR",
      details,
    );
  }

  return (await response.json()) as T;
}

export async function fetchLocations(): Promise<SquareLocation[]> {
  const response = await squareRequest<LocationsResponse>("/v2/locations", {
    method: "GET",
  });
  return response.locations ?? [];
}

export async function fetchCatalogItemsWithRelated(): Promise<{
  items: SquareCatalogObject[];
  relatedObjects: SquareCatalogObject[];
}> {
  const allItems: SquareCatalogObject[] = [];
  const allRelated: SquareCatalogObject[] = [];
  let cursor: string | undefined;

  do {
    const payload = {
      object_types: ["ITEM"],
      include_related_objects: true,
      cursor,
    };

    const response = await squareRequest<SearchCatalogResponse>(
      "/v2/catalog/search",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    allItems.push(...(response.objects ?? []));
    allRelated.push(...(response.related_objects ?? []));
    cursor = response.cursor;
  } while (cursor);

  return { items: allItems, relatedObjects: allRelated };
}
