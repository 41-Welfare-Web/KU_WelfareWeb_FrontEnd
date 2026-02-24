import type { CartGetResponse, UiCartItem } from "./types";

function toYmdFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export function toUiCartItems(data: CartGetResponse): UiCartItem[] {
  return (data.items ?? []).map((row) => ({
    cartId: row.id,
    itemId: row.item?.id ?? row.itemId,
    name: row.item?.name ?? "(이름 없음)",
    categoryName: row.item?.category?.name,
    count: row.quantity ?? 0,
    imageUrl: row.item?.imageUrl ?? undefined,
    startDate: toYmdFromIso(row.startDate),
    endDate: toYmdFromIso(row.endDate),
  }));
}
