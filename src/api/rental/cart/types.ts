// 서버 요청
export type AddCartRequest = {
  itemId: number;
  quantity: number;
};

export type CartUpdateRequest = {
  quantity: number;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"
};

// 공통 item/category
export type CartItemCategory = {
  id: number;
  name: string;
};

export type CartItemSummary = {
  id: number;
  name: string;
  itemCode: string;
  imageUrl: string | null;
  totalQuantity: number;
  category: CartItemCategory;
};

// 공통 장바구니 항목 응답
export type CartResponseItem = {
  id: number;
  userId: string;
  itemId: number;
  quantity: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  item: CartItemSummary;
};

// 서버 응답 (POST /api/cart)
export type CartAddResponse = CartResponseItem;

// 서버 응답 (GET /api/cart)
export type CartGetResponse = {
  items: CartResponseItem[];
  totalCount: number;
  hasUnsetDates: boolean;
};

// 서버 응답 (DELETE /api/cart/{id})
export type CartDeleteResponse = {
  message: string;
};

// 서버 응답 (PUT /api/cart/{id})
export type CartUpdateResponse = CartResponseItem;

// UI용
export type UiCartItem = {
  cartId: number; // 장바구니 항목 id
  itemId: number; // 물품 id
  name: string;
  categoryName?: string;
  count: number;
  totalQuantity: number;
  imageUrl?: string;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"

  originalStartDate?: string | null;
  originalEndDate?: string | null;
  originalCount?: number;
};
