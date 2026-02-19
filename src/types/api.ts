export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: string[];
}

export interface LocationDto {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ItemVariationDto {
  id: string;
  name: string;
  priceCents: number | null;
}

export interface MenuItemDto {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  variations: ItemVariationDto[];
}

export interface CategoryGroupDto {
  id: string;
  name: string;
  items: MenuItemDto[];
}

export interface CatalogResponseDto {
  locationId: string;
  categories: CategoryGroupDto[];
}

export interface CatalogCategoryDto {
  id: string;
  name: string;
  itemCount: number;
}
