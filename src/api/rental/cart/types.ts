// 서버 요청
export type AddCartRequest = {
  itemId: number;
  quantity: number;
};

// 서버 응답(POST /api/cart)
export type CartAddResponse = {
  id: number;
  userId: string;
  itemId: number;
  quantity: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  item: {
    id: number;
    categoryId: number;
    name: string;
    itemCode: string;
    description: string | null;
    rentalCount: number;
    imageUrl: string | null;
    managementType: string;
    totalQuantity: number;
    deletedAt: string | null;
    createdAt: string;
    category?: {
      id: number;
      name: string;
    };
  };
};

// 서버 응답(GET /api/cart)
export type CartGetResponse = {
  items: CartAddResponse[];
  totalCount: number;
  hasUnsetDates: boolean;
};

export type CartDeleteResponse = { message: string };

// 장바구니 항목 수정 (PUT /api/cart/{id})
export type CartUpdateResponse = {
  id: number;
  userId: string;
  itemId: number;
  quantity: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  item: {
    id: number;
    categoryId: number;
    name: string;
    itemCode: string;
    description: string | null;
    rentalCount: number;
    imageUrl: string | null;
    managementType: "BULK" | "INDIVIDUAL" | string;
    totalQuantity: number;
    deletedAt: string | null;
    createdAt: string;
    category?: { id: number; name: string };
  };
};

export type CartUpdateRequest = {
  quantity: number;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"
};

// UI용
export type UiCartItem = {
  cartId: number; // DELETE에 쓰는 id (장바구니 항목 id)
  itemId: number; // 물품 id (item.id)
  name: string;
  count: number;
  imageUrl?: string;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"

  originalStartDate?: string | null;
  originalEndDate?: string | null;
  originalCount?: number;
};
