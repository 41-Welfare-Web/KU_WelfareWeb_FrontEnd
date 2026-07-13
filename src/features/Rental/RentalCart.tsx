import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Calendar from "../../components/Rental/Calendar";

import {
  getMyCart,
  deleteCartItem,
  updateCartItem,
} from "../../api/rental/cart/cartApi";
import { toUiCartItems } from "../../api/rental/cart/mapper";
import type { UiCartItem } from "../../api/rental/cart/types";
import RentalCartItemRow from "../../components/Rental/RentalCartItemRow";
import { getItemAvailability } from "../../api/rental/calendar";
import type { Availability } from "../../api/rental/types";
import {
  createRentals,
  updateRental,
  getRentalDetail,
} from "../../api/rental/rentalApi";

import calendar from "../../assets/rental/calendar-orange.svg";
import RentalConfirmModal from "../../components/Rental/RentalConfirmModal";
import AdminUserSelectModal from "../../components/Admin/AdminUserSelectModal";

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

function isBetweenInclusive(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

async function checkEnoughForEdit(
  itemId: number,
  startDate: string,
  endDate: string,
  qty: number,
  originalStartDate: string,
  originalEndDate: string,
  originalQty: number,
) {
  const rows: Availability[] = await getItemAvailability({
    itemId,
    startDate,
    endDate,
  });

  if (!rows || rows.length === 0) return false;

  const adjustedRows = rows.map((row) => {
    const inOriginalRange = isBetweenInclusive(
      row.date,
      originalStartDate,
      originalEndDate,
    );

    return {
      ...row,
      availableQuantity: inOriginalRange
        ? (row.availableQuantity ?? 0) + originalQty
        : (row.availableQuantity ?? 0),
    };
  });

  const min = adjustedRows.reduce<number>(
    (acc, r) => Math.min(acc, r.availableQuantity ?? 0),
    Infinity,
  );

  return min >= qty;
}

function getApiErrorMessage(err: unknown) {
  const anyErr = err as any;

  const status: number | undefined = anyErr?.response?.status ?? anyErr?.status;

  const serverMsg: string | undefined =
    anyErr?.response?.data?.message ?? anyErr?.response?.data?.error?.message;

  const fallbackMsg =
    anyErr instanceof Error ? anyErr.message : "요청에 실패했어요.";

  return {
    status,
    message: serverMsg || fallbackMsg,
  };
}

type EditRentalData = {
  rentalId: number;
  departmentType: string;
  departmentName: string | null;
  startDate: string;
  endDate: string;
  items: {
    itemId: number;
    name: string;
    quantity: number;
    totalQuantity: number;
    imageUrl?: string;
    categoryName?: string;
    locked?: boolean;
    itemStatus?: string;
  }[];
  userName?: string;
  studentId?: string;
  phoneNumber?: string;
};

export default function RentalCart() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const navigate = useNavigate();
  const location = useLocation();

  // location.state에서 최초 예약자 정보 추출
  const initialAdminCreateFor = (location.state as any)?.adminCreateFor;

  // 예약자 선택 모달 상태
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  // 예약자 정보 상태 (관리자용)
  const [selectedUser, setSelectedUser] = useState<any>(initialAdminCreateFor || null);

  const [searchParams] = useSearchParams();
  const editRentalIdParam = searchParams.get("editRentalId");
  const isEditMode = !!editRentalIdParam;
  // 관리자 신규 예약: 선택된 사용자 정보
  const adminCreateFor = selectedUser || initialAdminCreateFor;
  const editFromAdminState = (location.state as any)?.isEditFromAdmin ? location.state : null;

  const [editRental, setEditRental] = useState<EditRentalData | null>(null);
  const [, setEditLoading] = useState(false);
  const [, setEditError] = useState<string | null>(null);

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

  // 초기 전체 판정 함수
  const buildInitialStatusMap = async (items: UiCartItem[]) => {
    const entries = await Promise.all(
      items.map(async (it) => {
        if (!it.startDate || !it.endDate) {
          return [it.cartId, "WAIT"] as const;
        }

        const ok =
          isEditMode &&
          it.originalStartDate &&
          it.originalEndDate &&
          typeof it.originalCount === "number"
            ? await checkEnoughForEdit(
                it.itemId,
                it.startDate,
                it.endDate,
                it.count,
                it.originalStartDate,
                it.originalEndDate,
                it.originalCount,
              )
            : await checkEnough(it.itemId, it.startDate, it.endDate, it.count);

        return [it.cartId, ok ? "OK" : "NO"] as const;
      }),
    );

    return Object.fromEntries(entries) as Record<number, "WAIT" | "OK" | "NO">;
  };

  const onCalendarChange = async (range: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    if (!selected) return;

    // 수정 모드: 날짜는 대여 건 단위 — 모든 품목에 동일하게 적용 후 전체 재검증
    if (isEditMode) {
      const nextItems = cartItems.map((x) => ({
        ...x,
        startDate: range.startDate,
        endDate: range.endDate,
      }));
      setCartItems(nextItems);

      if (!range.startDate || !range.endDate) {
        setStatusByCartId(
          Object.fromEntries(nextItems.map((x) => [x.cartId, "WAIT"] as const)),
        );
        return;
      }

      const entries = await Promise.all(
        nextItems.map(async (it) => {
          const ok =
            it.originalStartDate &&
            it.originalEndDate &&
            typeof it.originalCount === "number"
              ? await checkEnoughForEdit(
                  it.itemId,
                  range.startDate!,
                  range.endDate!,
                  it.count,
                  it.originalStartDate,
                  it.originalEndDate,
                  it.originalCount,
                )
              : await checkEnough(
                  it.itemId,
                  range.startDate!,
                  range.endDate!,
                  it.count,
                );
          return [it.cartId, ok ? "OK" : "NO"] as const;
        }),
      );
      setStatusByCartId(Object.fromEntries(entries));
      return;
    }

    patchLocalCart(selected.cartId, {
      startDate: range.startDate,
      endDate: range.endDate,
    });

    if (!range.startDate || !range.endDate) {
      setStatusByCartId((m) => ({ ...m, [selected.cartId]: "WAIT" }));
      return;
    }

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
      await fetchCart();
    } catch (e) {
      alert("기간 저장에 실패했어요.");
      await fetchCart();
    }
  };

  const onChangeQty = async (cartId: number, nextQty: number) => {
    const it = cartItems.find((x) => x.cartId === cartId);
    if (!it) return;

    if (isEditMode) {
      if (it.locked) return; // RESERVED가 아닌 품목은 수량 변경 불가
      patchLocalCart(cartId, { count: nextQty });

      if (it.startDate && it.endDate) {
        const ok =
          it.originalStartDate &&
          it.originalEndDate &&
          typeof it.originalCount === "number"
            ? await checkEnoughForEdit(
                it.itemId,
                it.startDate,
                it.endDate,
                nextQty,
                it.originalStartDate,
                it.originalEndDate,
                it.originalCount,
              )
            : await checkEnough(it.itemId, it.startDate, it.endDate, nextQty);

        setStatusByCartId((m) => ({ ...m, [cartId]: ok ? "OK" : "NO" }));
      }
      return;
    }

    try {
      const updated = await updateCartItem(cartId, {
        quantity: nextQty,
        startDate: it.startDate,
        endDate: it.endDate,
      });

      patchLocalCart(cartId, {
        count: updated.quantity,
        startDate: updated.startDate?.slice(0, 10) ?? null,
        endDate: updated.endDate?.slice(0, 10) ?? null,
      });

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
      await fetchCart();
    }
  };

  // 장바구니 목록 조회
  const fetchCart = async () => {
    if (isEditMode) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getMyCart();
      const mapped = toUiCartItems(data);

      setCartItems(mapped);

      const initialStatus = await buildInitialStatusMap(mapped);
      setStatusByCartId(initialStatus);
    } catch (e: any) {
      setError(e?.message ?? "장바구니를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 예약 수정
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isEditMode) {
        const rentalId = Number(editRentalIdParam);
        if (!Number.isFinite(rentalId)) {
          setEditError("수정할 예약 ID가 올바르지 않아요.");
          return;
        }

        setEditLoading(true);
        setEditError(null);


        try {
          const detail = await getRentalDetail(rentalId);

          const mappedEditRental: EditRentalData & {
            userName?: string;
            studentId?: string;
            phoneNumber?: string;
          } = {
            rentalId: detail.id,
            departmentType: detail.departmentType ?? "",
            departmentName: detail.departmentName ?? "",
            startDate: String(detail.startDate).slice(0, 10),
            endDate: String(detail.endDate).slice(0, 10),
            items: (detail.rentalItems ?? [])
              // 관리자: 취소 외 전체 표시 (RESERVED가 아닌 품목은 날짜만 변경 가능)
              // 일반 사용자: RESERVED 품목만 수정 가능
              .filter((ri: any) =>
                isAdmin ? ri.status !== 'CANCELED' : ri.status === 'RESERVED',
              )
              .map((ri: any) => ({
                itemId: ri.itemId ?? ri.item?.id,
                name: ri.item?.name ?? "이름 없음",
                quantity: ri.quantity ?? 1,
                totalQuantity: ri.item?.totalQuantity ?? 1,
                imageUrl: ri.item?.imageUrl ?? undefined,
                categoryName: ri.item?.category?.name ?? undefined,
                locked: ri.status !== 'RESERVED',
                itemStatus: ri.status,
              })),
            userName: detail.user?.name ?? "",
            studentId: detail.user?.studentId ?? "",
            phoneNumber: detail.user?.phoneNumber ?? "",
          };

          setEditRental(mappedEditRental);

          const mappedCartItems: UiCartItem[] = mappedEditRental.items.map(
            (it, idx) => ({
              cartId: -1000 - idx,
              itemId: it.itemId,
              name: it.name,
              count: it.quantity,
              totalQuantity: it.totalQuantity,
              startDate: mappedEditRental.startDate,
              endDate: mappedEditRental.endDate,
              originalStartDate: mappedEditRental.startDate,
              originalEndDate: mappedEditRental.endDate,
              originalCount: it.quantity,
              imageUrl: it.imageUrl,
              categoryName: it.categoryName,
              locked: it.locked,
              itemStatus: it.itemStatus,
            }),
          );

          setCartItems(mappedCartItems);
          setSelectedCartId(mappedCartItems[0]?.cartId ?? null);

          const initialStatus = await buildInitialStatusMap(mappedCartItems);
          setStatusByCartId(initialStatus);
        } catch (e: any) {
          setEditError(e?.message ?? "예약 정보를 불러오지 못했어요.");
        } finally {
          setEditLoading(false);
        }

        return;
      }

      await fetchCart();
    };

    fetchInitialData();
  }, [isEditMode, editRentalIdParam]);

  // 대여 물품 장바구니에서 삭제
  const handleRemove = async (cartId: number) => {
    if (isEditMode) {
      const target = cartItems.find((it) => it.cartId === cartId);
      if (target?.locked) {
        alert("예약 상태가 아닌 품목은 삭제할 수 없습니다.");
        return;
      }
      setCartItems((prev) => prev.filter((it) => it.cartId !== cartId));
      if (selectedCartId === cartId) {
        const rest = cartItems.filter((it) => it.cartId !== cartId);
        setSelectedCartId(rest[0]?.cartId ?? null);
      }
      return;
    }

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

      <div className="min-h-[calc(100dvh-80px)] bg-[linear-gradient(180deg,#FFDCC5_0.33%,#FFEDE2_57.71%,#FFFFFF_99.63%)]">
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
                  isAdmin={isAdmin}
                  value={{
                    startDate: selected.startDate,
                    endDate: selected.endDate,
                  }}
                  editAdjust={
                    isEditMode
                      ? {
                          originalStartDate: selected.originalStartDate ?? null,
                          originalEndDate: selected.originalEndDate ?? null,
                          originalCount: selected.originalCount ?? 0,
                        }
                      : null
                  }
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
                "h-140 md:h-160",
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
                  mode={isEditMode ? "edit" : "create"}
                  initialDepartmentType={
                    isEditMode
                      ? (editRental?.departmentType ?? "")
                      : adminCreateFor?.departmentType ?? ""
                  }
                  initialDepartmentName={
                    isEditMode
                      ? (editRental?.departmentName ?? "")
                      : adminCreateFor?.departmentName ?? ""
                  }
                  initialUserName={
                    isEditMode
                      ? editFromAdminState?.userName
                        ?? adminCreateFor?.userName
                        ?? editRental?.userName
                        ?? ""
                      : adminCreateFor?.userName ?? ""
                  }
                  initialStudentId={
                    isEditMode
                      ? editFromAdminState?.studentId
                        ?? adminCreateFor?.studentId
                        ?? editRental?.studentId
                        ?? ""
                      : adminCreateFor?.studentId ?? ""
                  }
                  initialPhoneNumber={
                    isEditMode
                      ? editFromAdminState?.phoneNumber
                        ?? adminCreateFor?.phoneNumber
                        ?? editRental?.phoneNumber
                        ?? ""
                      : adminCreateFor?.phoneNumber ?? ""
                  }
                  initialUserProfile={
                    adminCreateFor
                      ? {
                          name: adminCreateFor.userName,
                          studentId: adminCreateFor.studentId,
                          phoneNumber: adminCreateFor.phoneNumber || "",
                          departmentType: adminCreateFor.departmentType,
                          departmentName: adminCreateFor.departmentName,
                        }
                      : undefined
                  }
                  editRentalId={
                    isEditMode ? Number(editRentalIdParam) : undefined
                  }
                  editItems={
                    isEditMode
                      ? cartItems.map((it) => ({
                          itemId: it.itemId,
                          name: it.name,
                          quantity: it.count,
                          startDate: it.startDate,
                          endDate: it.endDate,
                        }))
                      : undefined
                  }
                  onSubmit={async ({
                    departmentType,
                    departmentName,
                    cartItems: modalCartItems,
                  }) => {
                    try {
                      // 수정 모드: URL에 editRentalId가 있으면 수정 API 호출
                      if (isEditMode) {
                        const editRentalId = Number(editRentalIdParam);
                        if (!Number.isFinite(editRentalId)) {
                          alert("수정할 예약 ID가 올바르지 않아요.");
                          return;
                        }

                        if (!cartItems.length) {
                          alert("수정할 물품이 없어요.");
                          return;
                        }

                        const first = cartItems[0];
                        if (!first.startDate || !first.endDate) {
                          alert("대여 기간을 선택해주세요.");
                          return;
                        }

                        // RESERVED 품목만 items로 전송 — 그 외 품목은 상태 유지, 날짜만 대여 건 단위로 변경
                        const editableItems = cartItems.filter((it) => !it.locked);

                        if (editableItems.length > 0) {
                          await updateRental(editRentalId, {
                            departmentType,
                            departmentName,
                            items: editableItems.map((it) => ({
                              itemId: it.itemId,
                              quantity: it.count,
                              startDate: String(it.startDate ?? "").slice(0, 10),
                              endDate: String(it.endDate ?? "").slice(0, 10),
                            })),
                          }, isAdmin);
                        } else {
                          // RESERVED 품목이 없으면 날짜만 수정
                          await updateRental(editRentalId, {
                            departmentType,
                            departmentName,
                            startDate: String(first.startDate).slice(0, 10),
                            endDate: String(first.endDate).slice(0, 10),
                          }, isAdmin);
                        }

                        alert("예약이 수정되었습니다.");
                        setConfirmOpen(false);
                        // 관리자 모드와 일반 사용자 모드 구분
                        if (isAdmin) {
                          navigate("/admin");
                        } else {
                          navigate("/mypage?tab=rental");
                        }
                        return;
                      }

                      // 신규 예약: 일반/관리자 분기
                      let result;
                      if (adminCreateFor) {
                        // 관리자 대리 예약
                        const { userId } = adminCreateFor;
                        result = await import("../../api/rental/rentalApi").then(mod => mod.createAdminRental({
                          departmentType,
                          departmentName,
                          items: modalCartItems.map((it: any) => ({
                            itemId: it.item?.id ?? it.itemId,
                            quantity: it.quantity ?? it.count ?? 1,
                            startDate: String(it.startDate ?? "").slice(0, 10),
                            endDate: String(it.endDate ?? "").slice(0, 10),
                          })),
                          targetUserId: userId,
                        }));

                        // 대리예약 성공 시 장바구니 비우기
                        try {
                          const cartData = await import("../../api/rental/cart/cartApi").then(mod => mod.getMyCart());
                          const cartIds = (cartData.items ?? []).map((item: any) => item.id || item.cartId);
                          for (const cartId of cartIds) {
                            await import("../../api/rental/cart/cartApi").then(mod => mod.deleteCartItem(cartId));
                          }
                        } catch (e) {
                          // 실패해도 무시(알림만)
                          console.warn("관리자 대리예약 후 장바구니 비우기 실패:", e);
                        }
                      } else {
                        // 일반 사용자 예약
                        result = await createRentals({
                          departmentType,
                          departmentName,
                          items: modalCartItems.map((it: any) => ({
                            itemId: it.item?.id ?? it.itemId,
                            quantity: it.quantity ?? it.count ?? 1,
                            startDate: String(it.startDate ?? "").slice(0, 10),
                            endDate: String(it.endDate ?? "").slice(0, 10),
                          })),
                        });
                      }

                      navigate("/rental/complete", { state: { result } });
                      setConfirmOpen(false);
                      await fetchCart();
                    } catch (e) {
                      console.error("예약 처리 실패:", e);
                      const { status, message } = getApiErrorMessage(e);

                      // 400/409는 서버 이유 그대로 alert
                      if (status === 400 || status === 409) {
                        alert(message);
                        return;
                      }

                      alert(message || "요청에 실패했어요. 다시 시도해주세요.");
                    }
                  }}
                  onEditUser={() => setUserSelectOpen(true)}
                />

                {/* 예약자 선택 모달 */}
                <AdminUserSelectModal
                  isOpen={userSelectOpen}
                  onClose={() => setUserSelectOpen(false)}
                  onSelectUser={(user) => {
                    setSelectedUser({
                      userId: user.id,
                      userName: user.name,
                      studentId: user.studentId,
                      phoneNumber: user.phoneNumber || "",
                      departmentType: user.departmentType,
                      departmentName: user.departmentName,
                    });
                    setUserSelectOpen(false);
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
