import type { CartGetResponse, UiCartItem } from "./types";

export function toUiCartItems(data: CartGetResponse): UiCartItem[] {
  return (data.items ?? []).map((row) => ({
    cartId: row.id,
    itemId: row.item?.id ?? row.itemId,
    name: row.item?.name ?? "(이름 없음)",
    count: row.quantity ?? 0,
    imageUrl: row.item?.imageUrl ?? undefined,
  }));
}
