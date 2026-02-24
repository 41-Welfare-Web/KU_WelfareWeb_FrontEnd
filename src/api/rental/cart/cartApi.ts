import axiosInstance from "../../axiosInstance";
import type {
  AddCartRequest,
  CartAddResponse,
  CartGetResponse,
  CartDeleteResponse,
} from "./types";

// 장바구니 물품 추가 (POST /api/cart)
export async function addToCart(body: AddCartRequest) {
  const res = await axiosInstance.post<CartAddResponse>("/api/cart", body);
  return res.data;
}

// 내 장바구니 조회 (GET /api/cart)
export async function getMyCart() {
  const res = await axiosInstance.get<CartGetResponse>("/api/cart");
  return res.data;
}

// 장바구니 항목 삭제 (DELETE /api/cart/{id})
export async function deleteCartItem(cartId: number) {
  const res = await axiosInstance.delete<CartDeleteResponse>(
    `/api/cart/${cartId}`,
  );
  return res.data;
}
