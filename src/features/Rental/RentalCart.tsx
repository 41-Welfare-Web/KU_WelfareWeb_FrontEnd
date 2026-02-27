import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Calendar from "../../components/Rental/Calendar";

import {
  getMyCart,
  deleteCartItem,
  updateCartItem,
} from "../../api/rental/cart/cartApi";
import { toUiCartItems } from "../../api/rental/cart/mapper";
import type { UiCartItem, CartAddResponse } from "../../api/rental/cart/types";
import RentalCartItemRow from "../../components/Rental/RentalCartItemRow";
import { getItemAvailability } from "../../api/rental/calendar";
import type { Availability } from "../../api/rental/types";
import { createRentals } from "../../api/rental/rentalApi";
import type { UserProfile } from "../../services/userApi";

import calendar from "../../assets/rental/calendar-orange.svg";
import RentalConfirmModal from "../../components/Rental/RentalConfirmModal";

async function checkEnough(
  itemId: number,
  startDate: string,
  endDate: string,
  qty: number,
) {
  const rows: Availability[] = await getItemAvailability({
    itemId,
    startDate,
    endDate,
  });

  if (!rows || rows.length === 0) return false;

  const min = rows.reduce<number>(
    (acc, r) => Math.min(acc, r.availableQuantity ?? 0),
    Infinity,
  );

  return min >= qty;
}

export default function RentalCart() {
  const [cartItems, setCartItems] = useState<UiCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
  const selected =
    cartItems.find((x) => x.cartId === selectedCartId) ?? cartItems[0] ?? null;

  useEffect(() => {
    // 아직 선택된 게 없고, 장바구니에 아이템이 있으면 첫 번째를 기본 선택
    if (selectedCartId == null && cartItems.length > 0) {
      setSelectedCartId(cartItems[0].cartId);
      return;
    }

    // 선택된 항목이 삭제되어 목록에 없으면 첫 번째로 다시 선택
    if (
      selectedCartId != null &&
      cartItems.length > 0 &&
      !cartItems.some((it) => it.cartId === selectedCartId)
    ) {
      setSelectedCartId(cartItems[0].cartId);
    }

    // 장바구니가 비면 선택 해제
    if (cartItems.length === 0 && selectedCartId != null) {
      setSelectedCartId(null);
    }
  }, [cartItems, selectedCartId]);

  // row 상태 저장 (cartId -> "WAIT"|"OK"|"NO")
  const [statusByCartId, setStatusByCartId] = useState<
    Record<number, "WAIT" | "OK" | "NO">
  >({});

  const patchLocalCart = (cartId: number, patch: Partial<UiCartItem>) => {
    setCartItems((prev) =>
      prev.map((x) => (x.cartId === cartId ? { ...x, ...patch } : x)),
    );
  };

  useEffect(() => {
    const next: Record<number, "WAIT" | "OK" | "NO"> = {};
    cartItems.forEach((it) => {
      next[it.cartId] = it.startDate && it.endDate ? "WAIT" : "WAIT";
    });
    setStatusByCartId(next);
  }, [cartItems]);

  const onCalendarChange = async (range: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    if (!selected) return;

    // 클릭 즉시 UI 반영
    patchLocalCart(selected.cartId, {
      startDate: range.startDate,
      endDate: range.endDate,
    });

    // 상태도 즉시 반영
    if (!range.startDate || !range.endDate) {
      setStatusByCartId((m) => ({ ...m, [selected.cartId]: "WAIT" }));
      return;
    }

    // 기간이 완성되면: 가능/불가 판정 + PUT 저장
    const ok = await checkEnough(
      selected.itemId,
      range.startDate,
      range.endDate,
      selected.count,
    );
    setStatusByCartId((m) => ({ ...m, [selected.cartId]: ok ? "OK" : "NO" }));

    try {
      await updateCartItem(selected.cartId, {
        quantity: selected.count,
        startDate: range.startDate,
        endDate: range.endDate,
      });

      // 선택: 서버값으로 다시 동기화하고 싶으면 유지
      await fetchCart();
    } catch (e) {
      alert("기간 저장에 실패했어요.");

      // 실패 시 원복하고 싶으면 fetchCart()로 강제 동기화
      await fetchCart();
    }
  };

  const onChangeQty = async (cartId: number, nextQty: number) => {
    const it = cartItems.find((x) => x.cartId === cartId);
    if (!it) return;

    try {
      const updated = await updateCartItem(cartId, {
        quantity: nextQty,
        startDate: it.startDate,
        endDate: it.endDate,
      });

      // 서버 응답이 정확하니까 이걸로 즉시 반영
      patchLocalCart(cartId, {
        count: updated.quantity,
        startDate: updated.startDate?.slice(0, 10) ?? null,
        endDate: updated.endDate?.slice(0, 10) ?? null,
      });

      // 기간이 있으면 재검증
      if (it.startDate && it.endDate) {
        const ok = await checkEnough(
          it.itemId,
          it.startDate,
          it.endDate,
          nextQty,
        );
        setStatusByCartId((m) => ({ ...m, [cartId]: ok ? "OK" : "NO" }));
      }
    } catch (e) {
      console.error(e);
      alert("수량 저장에 실패했어요.");
      // 실패 시에만 서버로 다시 동기화
      await fetchCart();
    }
  };

  // 장바구니 목록 조회
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCart();
      setCartItems(toUiCartItems(data));
    } catch (e: any) {
      setError(e?.message ?? "장바구니를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 대여 가능/불가 판정
  const validateCartItem = async (it: UiCartItem) => {
    if (!it.startDate || !it.endDate) {
      setStatusByCartId((m) => ({ ...m, [it.cartId]: "WAIT" }));
      return;
    }
    const ok = await checkEnough(it.itemId, it.startDate, it.endDate, it.count);
    setStatusByCartId((m) => ({ ...m, [it.cartId]: ok ? "OK" : "NO" }));
  };

  useEffect(() => {
    cartItems.forEach((it) => {
      if (it.startDate && it.endDate) validateCartItem(it);
    });
  }, [cartItems]);

  // 대여 물품 장바구니에서 삭제
  const handleRemove = async (cartId: number) => {
    try {
      await deleteCartItem(cartId);
      await fetchCart();
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했어요.");
    }
  };

  // 모든 물품이 대여 가능인지 확인
  const allAvailable =
    cartItems.length > 0 &&
    cartItems.every((it) => statusByCartId[it.cartId] === "OK");

  return (
    <>
      <Header />

      <div className="min-h-[calc(100dvh-80px)] bg-[linear-gradient(180deg,_#FFDCC5_0.33%,_#FFEDE2_57.71%,_#FFFFFF_99.63%)]">
        <div className="mx-auto max-w-[1440px] px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 왼쪽: 기간 선택 */}
            <section className="bg-white rounded-2xl p-9">
              <div className="mb-4 flex flex-row items-center gap-2 text-[clamp(18px,2.5vw,24px)] font-bold text-black">
                <img src={calendar} alt="캘린더" />
                <span>기간 선택</span>
              </div>

              {selected ? (
                <Calendar
                  itemId={selected.itemId}
                  requestedQty={selected.count}
                  value={{
                    startDate: selected.startDate,
                    endDate: selected.endDate,
                  }}
                  onChange={onCalendarChange}
                />
              ) : (
                <div>장바구니에 물품을 담아주세요.</div>
              )}
            </section>

            {/* 오른쪽: 신청 물품 */}
            <section
              className={[
                "rounded-2xl bg-white border border-black/10 shadow-[0_10px_24px_rgba(0,0,0,0.10)]",
                "p-9",
                "flex flex-col",
                "h-[560px] md:h-[640px]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="text-[clamp(18px,2.5vw,24px)] font-bold text-black">
                  신청 물품 ({cartItems.length})
                </div>
              </div>

              <div className="shrink-0">
                {loading && (
                  <div className="mt-3 text-sm text-black/50">불러오는 중…</div>
                )}
                {error && (
                  <div className="mt-3 text-sm text-red-600">{error}</div>
                )}
                {!loading && !error && cartItems.length === 0 && (
                  <div className="mt-4 rounded-xl bg-white border border-black/10 p-4 text-black/60">
                    장바구니가 비어있어요.
                  </div>
                )}
              </div>

              {/* 장바구니 리스트 (스크롤가능) */}
              <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {cartItems.map((it) => (
                    <RentalCartItemRow
                      key={it.cartId}
                      item={it}
                      selected={it.cartId === selectedCartId}
                      status={
                        statusByCartId[it.cartId] ??
                        (it.startDate && it.endDate ? "OK" : "WAIT")
                      }
                      onSelect={() => setSelectedCartId(it.cartId)}
                      onRemove={() => handleRemove(it.cartId)}
                      onChangeQty={(nextQty) => onChangeQty(it.cartId, nextQty)}
                    />
                  ))}
                </div>
              </div>

              <div className="shrink-0 pt-4">
                <button
                  type="button"
                  disabled={!allAvailable}
                  className="w-full rounded-lg bg-[#FE6949] px-4 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
                  onClick={() => setConfirmOpen(true)}
                >
                  예약 확정하기
                </button>

                <RentalConfirmModal
                  open={confirmOpen}
                  onClose={() => setConfirmOpen(false)}
                  onSubmit={async ({ cartItems }) => {
                    try {
                      await createRentals({
                        items: cartItems.map((it) => ({
                          itemId: it.itemId,
                          quantity: it.quantity,
                          startDate: (it.startDate ?? "").slice(0, 10),
                          endDate: (it.endDate ?? "").slice(0, 10),
                        })),
                      });

                      setConfirmOpen(false);
                    } catch (e) {
                      console.error("대여 신청 실패:", e);
                      alert(
                        e instanceof Error
                          ? e.message
                          : "대여 신청에 실패했어요. 다시 시도해주세요.",
                      );
                    }
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
