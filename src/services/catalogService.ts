import type {
  CatalogCategoryDto,
  CatalogResponseDto,
  CategoryGroupDto,
  LocationDto,
  MenuItemDto,
} from "../types/api.js";
import {
  fetchCatalogItemsWithRelated,
  fetchLocations,
  type SquareCatalogObject,
} from "./squareClient.js";

function formatAddress(location: {
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
    country?: string;
  };
}): string {
  const address = location.address;
  const parts = [
    address?.address_line_1,
    address?.locality,
    address?.administrative_district_level_1,
    address?.postal_code,
    address?.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export async function getActiveLocations(): Promise<LocationDto[]> {
  const locations = await fetchLocations();
  return locations
    .filter((location) => location.status === "ACTIVE")
    .map((location) => ({
      id: location.id ?? "",
      name: location.name ?? "Unnamed location",
      address: formatAddress(location),
      timezone: location.timezone ?? "",
      status: "ACTIVE" as const,
    }))
    .filter((location) => location.id.length > 0);
}

function isPresentAtLocation(item: SquareCatalogObject, locationId: string): boolean {
  if (item.present_at_all_locations) return true;
  return (item.present_at_location_ids ?? []).includes(locationId);
}

function asMap<T extends { id: string }>(objects: T[]): Map<string, T> {
  return new Map(objects.map((obj) => [obj.id, obj]));
}

function normalizeItems(
  items: SquareCatalogObject[],
  relatedObjects: SquareCatalogObject[],
  locationId: string,
): MenuItemDto[] {
  const categories = asMap(
    relatedObjects.filter((obj) => obj.type === "CATEGORY"),
  );
  const images = asMap(relatedObjects.filter((obj) => obj.type === "IMAGE"));

  return items
    .filter((obj) => obj.type === "ITEM" && isPresentAtLocation(obj, locationId))
    .map((item) => {
      const itemData = item.item_data;
      const categoryObj = categories.get(itemData?.category_id ?? "");
      const imageId = itemData?.image_ids?.[0];
      const imageObj = imageId ? images.get(imageId) : undefined;

      const variations = (itemData?.variations ?? [])
        .map((variation) => ({
          id: variation.id,
          name: variation.item_variation_data?.name ?? "Default",
          priceCents: variation.item_variation_data?.price_money?.amount ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        id: item.id,
        name: itemData?.name ?? "Untitled item",
        description: itemData?.description ?? "",
        category: categoryObj?.category_data?.name ?? "Uncategorized",
        imageUrl: imageObj?.image_data?.url ?? null,
        variations,
      };
    });
}

export async function getCatalogByLocation(
  locationId: string,
): Promise<CatalogResponseDto> {
  const { items, relatedObjects } = await fetchCatalogItemsWithRelated();
  const normalizedItems = normalizeItems(items, relatedObjects, locationId);

  const grouped = new Map<string, CategoryGroupDto>();
  for (const item of normalizedItems) {
    const key = item.category;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key.toLowerCase().replace(/\s+/g, "-"),
        name: key,
        items: [],
      });
    }
    grouped.get(key)?.items.push(item);
  }

  return {
    locationId,
    categories: [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getCategoriesByLocation(
  locationId: string,
): Promise<CatalogCategoryDto[]> {
  const catalog = await getCatalogByLocation(locationId);
  return catalog.categories.map((category) => ({
    id: category.id,
    name: category.name,
    itemCount: category.items.length,
  }));
}
