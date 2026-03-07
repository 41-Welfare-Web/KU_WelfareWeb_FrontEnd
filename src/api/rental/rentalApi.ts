import axiosInstance from "../axiosInstance";
import { API_BASE_URL } from "../client";
import type {
  Category,
  Item,
  ItemsQuery,
  ItemDetail,
  RentalCreateRequest,
  RentalCreateResponse,
  RentalDetail,
  RentalUpsertRequest,
  RentalUpsertResponse,
} from "./types";

function buildQuery(params: ItemsQuery) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (!v) return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error("요청 실패");
  }
  return (await res.json()) as T;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  return parseJson<Category[]>(res);
}

export async function getItems(params: ItemsQuery): Promise<Item[]> {
  const qs = buildQuery(params);
  const res = await fetch(`${API_BASE_URL}/api/items${qs}`);
  return parseJson<Item[]>(res);
}

export async function getItemDetail(itemId: number): Promise<ItemDetail> {
  const res = await fetch(`${API_BASE_URL}/api/items/${itemId}`);
  return parseJson<ItemDetail>(res);
}

// 새 대여 예약 생성 (POST /api/rentals)
export async function createRentals(body: RentalCreateRequest) {
  const res = await axiosInstance.post<RentalCreateResponse>(
    "/api/rentals",
    body,
  );
  return res.data;
}

// 대여 예약 상세조회 (GET /api/rentals/{id})
export async function getRentalDetail(rentalId: number) {
  const res = await axiosInstance.get<RentalDetail>(`/api/rentals/${rentalId}`);
  return res.data;
}

// 대여 예약 수정 (PUT /api/rentals/{id})
export async function updateRental(
  rentalId: number,
  body: RentalUpsertRequest,
) {
  const res = await axiosInstance.put<RentalUpsertResponse>(
    `/api/rentals/${rentalId}`,
    body,
  );
  return res.data;
}
