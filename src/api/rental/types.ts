export type SortBy = "popularity" | "name" | "createdAt";
export type SortOrder = "asc" | "desc";

export type Category = {
  id: number;
  name: string;
};

export type Item = {
  id: number;
  category: { id: number; name: string };
  categoryId: number;

  name: string;
  description: string | null;

  itemCode: string;
  rentalCount: number;

  imageUrl: string | null;

  managementType: "INDIVIDUAL" | "BULK";
  totalQuantity: number;
  currentStock: number;

  createdAt: string;
};

export type ItemsQuery = {
  search?: string;
  categoryIds?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};
