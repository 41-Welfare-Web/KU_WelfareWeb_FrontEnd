import { useEffect, useMemo, useState } from "react";
import cancel from "../../assets/rental/cancel-white.svg";

import { getMyProfile } from "../../services/userApi";
import type { UserProfile } from "../../services/userApi";
import { useMetadata } from "../../contexts/MetadataContext";

import { getMyCart } from "../../api/rental/cart/cartApi";
import type {
  CartAddResponse,
  CartGetResponse,
} from "../../api/rental/cart/types";
import DepartmentPickerModal from "../DepartmentPickerModal";
import { createRentals } from "../../api/rental/rentalApi";
import type { RentalCreateRequest } from "../../api/rental/types";

type Props = {
  open: boolean;
  onClose: () => void;

  onSubmit?: (payload: {
    departmentType: string;
    departmentName: string;
    cartItems: CartAddResponse[];
    profile: UserProfile;
  }) => void;
};

export default function RentalConfirmModal({ open, onClose, onSubmit }: Props) {
  const { deptGroups, loading: metaLoading } = useMetadata();

  // 신청자 정보
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 대분류 선택값(문자열)
  const [department, setDepartment] = useState<{
    departmentType: string;
    departmentName: string;
  }>({ departmentType: "", departmentName: "" });

  const [deptPickerOpen, setDeptPickerOpen] = useState(false);

  // 장바구니
  const [cart, setCart] = useState<CartGetResponse | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // 대분류 옵션(문자열)
  const deptTypeOptions = useMemo(() => {
    return deptGroups
      .map((g: any) => (g.type ?? g.name ?? "").trim())
      .filter(Boolean);
  }, [deptGroups]);

  // 예약 확정
  const [submitLoading, setSubmitLoading] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      if (!profile || !cart) throw new Error("정보를 불러오는 중이에요.");
      if (!department.departmentType || !department.departmentName) {
        throw new Error("소속을 선택해주세요.");
      }

      await onSubmit?.({
        departmentType: department.departmentType,
        departmentName: department.departmentName,
        cartItems: cart.items ?? [],
        profile,
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "신청에 실패했어요.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // open될 때: profile + cart 로드
  useEffect(() => {
    if (!open) return;

    let alive = true;

    // 1) profile
    setProfileLoading(true);
    setProfileError(null);
    getMyProfile()
      .then((p) => {
        if (!alive) return;
        setProfile(p);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setProfileError(
          e instanceof Error ? e.message : "사용자 정보를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!alive) return;
        setProfileLoading(false);
      });

    // 2) cart
    setCartLoading(true);
    setCartError(null);
    getMyCart()
      .then((data) => {
        if (!alive) return;
        setCart(data);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setCartError(
          e instanceof Error ? e.message : "장바구니를 불러오지 못했어요.",
        );
      })
      .finally(() => {
        if (!alive) return;
        setCartLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!profile) return;
    if (!deptTypeOptions.length) return;
    if (department.departmentType) return;

    const profileDeptType = (profile as any).departmentType?.trim?.() ?? "";
    const profileDeptName = (profile as any).departmentName?.trim?.() ?? "";

    if (profileDeptType || profileDeptName) {
      setDepartment({
        departmentType: profileDeptType,
        departmentName: profileDeptName,
      });
    }
  }, [open, profile, deptTypeOptions, department.departmentType]);

  const cartItems = cart?.items ?? [];
  const totalCount =
    cart?.totalCount ?? cartItems.reduce((s, it) => s + (it.quantity ?? 0), 0);

  const canSubmit = useMemo(() => {
    if (!profile) return false;
    if (!department.departmentType) return false;
    if (!department.departmentName) return false;
    if (cartItems.length === 0) return false;
    if (cart?.hasUnsetDates) return false;
    return true;
  }, [
    profile,
    department.departmentType,
    department.departmentName,
    cartItems.length,
    cart?.hasUnsetDates,
  ]);

  if (!open) return null;

  function ymd(iso: string) {
    return iso.slice(0, 10);
  }

  function fmtRange(start: string | null, end: string | null) {
    if (!start || !end) return "-";
    return `${ymd(start)} ~ ${ymd(end)}`;
  }

  return (
    <>
      <DepartmentPickerModal
        open={deptPickerOpen}
        onClose={() => setDeptPickerOpen(false)}
        value={
          department.departmentType || department.departmentName
            ? department
            : undefined
        }
        onConfirm={(next) => {
          setDepartment(next);
        }}
        title="소속 선택"
      />
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-[min(720px,92vw)] max-h-[86dvh] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#001A37] px-6 py-4">
            <div className="text-[clamp(20px,3vw,30px)] font-bold text-white">
              신청 정보 확인
            </div>
            <button type="button" onClick={onClose} className="p-2">
              <img src={cancel} alt="닫기" className="h-8 w-8" />
            </button>
          </div>

          <div className="flex max-h-[calc(86dvh-64px)] flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
              {/* 에러/로딩 */}
              {(profileLoading || metaLoading || cartLoading) && (
                <div className="mb-4 text-sm text-black/50">불러오는 중…</div>
              )}
              {profileError && (
                <div className="mb-3 text-sm text-red-600">{profileError}</div>
              )}
              {cartError && (
                <div className="mb-3 text-sm text-red-600">{cartError}</div>
              )}

              {/* 사용자 정보 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-black/70">
                    이름
                  </div>
                  <input
                    value={profile?.name ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-4 py-3 text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-black/70">
                    학번
                  </div>
                  <input
                    value={profile?.studentId ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-4 py-3 text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-black/70">
                    전화번호
                  </div>
                  <input
                    value={profile?.phoneNumber ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-4 py-3 text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-black/70">
                    소속단위
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeptPickerOpen(true)}
                    disabled={metaLoading || deptTypeOptions.length === 0}
                    className={[
                      "w-full rounded-xl bg-[#EDEDED] px-4 py-3 text-left text-[15px] text-black outline-none",
                      "disabled:opacity-60",
                    ].join(" ")}
                  >
                    {department.departmentType && department.departmentName
                      ? `${department.departmentType} / ${department.departmentName}`
                      : "선택"}
                  </button>

                  <div className="mt-2 text-xs text-black/50">
                    클릭해서 소속을 선택해주세요.
                  </div>
                </div>
              </div>

              {/* 대여 품목 */}
              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold text-black/70">
                  대여 품목
                </div>
                <div className="rounded-2xl bg-black/5 p-4">
                  {!cartLoading && !cartError && cartItems.length === 0 && (
                    <div className="text-sm text-black/50">
                      장바구니가 비어있어요.
                    </div>
                  )}

                  {!cartLoading && !cartError && cartItems.length > 0 && (
                    <>
                      <div className="space-y-2">
                        {cartItems.map((it) => (
                          <div
                            key={it.id}
                            className="grid grid-cols-3 items-center gap-4 py-2"
                          >
                            <div className="text-left min-w-0 truncate text-[15px] font-semibold text-black">
                              {it.item?.name ?? "이름 없음"}
                            </div>

                            <div className="text-center whitespace-nowrap text-[15px] text-black">
                              {fmtRange(it.startDate, it.endDate)}
                            </div>

                            <div className="text-right whitespace-nowrap text-[15px] font-semibold text-black">
                              {it.quantity}개
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-black/10 pt-3 flex items-center justify-between">
                        <div className="text-[16px] font-bold text-black">
                          총 수량
                        </div>
                        <div className="text-[16px] font-bold text-black">
                          {totalCount}개
                        </div>
                      </div>

                      {cart?.hasUnsetDates && (
                        <div className="mt-3 text-xs text-red-600">
                          대여 기간이 설정되지 않은 물품이 있어요. 기간을 선택한
                          뒤 다시 시도해주세요.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="shrink-0 border-t border-black/10 bg-white px-6 py-5">
              <button
                type="button"
                disabled={!canSubmit || submitLoading}
                className="w-full rounded-xl bg-[#F72] px-4 py-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(254,105,73,0.35)] disabled:opacity-40"
                onClick={handleSubmit}
              >
                {submitLoading ? "예약 중..." : "✓ 위 정보로 신청하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
