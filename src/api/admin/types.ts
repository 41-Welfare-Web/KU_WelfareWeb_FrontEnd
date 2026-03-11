// 물품 생성(POST /api/items)
export type CreateItemRequest = {
  categoryId: number;
  name: string;
  itemCode: string;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  videoUrl?: string | null;
  managementType: "INDIVIDUAL" | "BULK";
  totalQuantity: number;
};
