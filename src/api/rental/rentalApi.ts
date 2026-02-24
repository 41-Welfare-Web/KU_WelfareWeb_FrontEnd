import { API_BASE_URL } from "../client";
import type { Category, Item, ItemsQuery, ItemDetail } from "./types";

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
