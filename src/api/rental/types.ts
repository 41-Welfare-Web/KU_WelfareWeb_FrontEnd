export type SortBy = "popularity" | "name" | "createdAt";
export type SortOrder = "asc" | "desc";

// 카테고리 조회
export type Category = {
  id: number;
  name: string;
};

// 물품 목록 조회
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

// 물품 상세 조회
export type ItemDetail = Item;

// 물품 목록 쿼리
export type ItemsQuery = {
  search?: string;
  categoryIds?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

// 캘린더 가능
export type Availability = {
  date: string;
  availableQuantity: number;
  totalQuantity: number;
};
