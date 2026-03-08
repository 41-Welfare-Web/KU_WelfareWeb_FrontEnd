import { useEffect, useMemo, useState } from "react";
import cancel from "../../assets/rental/cancel-white.svg";

import { getMyProfile } from "../../services/userApi";
import type { UserProfile } from "../../services/userApi";
import { useMetadata } from "../../contexts/MetadataContext";

import { getMyCart } from "../../api/rental/cart/cartApi";
import DepartmentPickerModal from "../DepartmentPickerModal";

type ConfirmMode = "create" | "edit";

export type ConfirmItem = {
  itemId: number;
  name: string;
  quantity: number;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"
};

type Props = {
  open: boolean;
  onClose: () => void;

  mode?: ConfirmMode; // default "create"
  editRentalId?: number;
  editItems?: ConfirmItem[];

  initialDepartmentType?: string;
  initialDepartmentName?: string;

  onSubmit?: (payload: {
    departmentType: string;
    departmentName: string;
    cartItems: ConfirmItem[];
    profile: UserProfile;
    mode: ConfirmMode;
    editRentalId?: number;
  }) => void;
};

export default function RentalConfirmModal({
  open,
  onClose,
  onSubmit,
  mode = "create",
  editRentalId,
  editItems,
  initialDepartmentType = "",
  initialDepartmentName = "",
}: Props) {
  const { deptGroups, loading: metaLoading } = useMetadata();

  // 신청자 정보
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 소속 선택값
  const [department, setDepartment] = useState<{
    departmentType: string;
    departmentName: string;
  }>({ departmentType: "", departmentName: "" });
  const [deptPickerOpen, setDeptPickerOpen] = useState(false);

  // (create) 장바구니 대신, 모달 내부에서 공통 items로 통일
  const [items, setItems] = useState<ConfirmItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // 예약 확정
  const [submitLoading, setSubmitLoading] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);

  // 대분류 옵션
  const deptTypeOptions = useMemo(() => {
    return deptGroups
      .map((g: any) => (g.type ?? g.name ?? "").trim())
      .filter(Boolean);
  }, [deptGroups]);

  // open될 때: profile + (create면 cart) / (edit면 editItems)
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

    // 2) items
    setItemsLoading(true);
    setItemsError(null);

    if (mode === "edit") {
      setItems(editItems ?? []);
      setItemsLoading(false);
    } else {
      getMyCart()
        .then((data) => {
          if (!alive) return;
          const mapped: ConfirmItem[] = (data.items ?? []).map((it: any) => ({
            itemId: it.item?.id ?? it.itemId,
            name: it.item?.name ?? "이름 없음",
            quantity: it.quantity ?? 1,
            startDate: it.startDate?.slice(0, 10) ?? null,
            endDate: it.endDate?.slice(0, 10) ?? null,
          }));
          setItems(mapped);
        })
        .catch((e: unknown) => {
          if (!alive) return;
          setItemsError(
            e instanceof Error ? e.message : "장바구니를 불러오지 못했어요.",
          );
        })
        .finally(() => {
          if (!alive) return;
          setItemsLoading(false);
        });
    }

    return () => {
      alive = false;
    };
  }, [open, mode, editItems]);

  // 프로필 로드 후: 기본 소속 세팅 (한 번만)
  useEffect(() => {
    if (!open) return;
    if (!deptTypeOptions.length) return;

    const initialType = initialDepartmentType?.trim?.() ?? "";
    const initialName = initialDepartmentName?.trim?.() ?? "";

    // 1순위: 부모가 넘겨준 초기값 (수정 모드)
    if (initialType || initialName) {
      setDepartment({
        departmentType: initialType,
        departmentName: initialName,
      });
      return;
    }

    // 2순위: 내 프로필 소속 (신규 모드)
    if (!profile) return;

    const profileDeptType = (profile as any).departmentType?.trim?.() ?? "";
    const profileDeptName = (profile as any).departmentName?.trim?.() ?? "";

    setDepartment({
      departmentType: profileDeptType,
      departmentName: profileDeptName,
    });
  }, [
    open,
    profile,
    deptTypeOptions,
    initialDepartmentType,
    initialDepartmentName,
  ]);

  useEffect(() => {
    if (!open) return;

    setDepartment({
      departmentType: "",
      departmentName: "",
    });
  }, [open]);

  const cartItems = items;

  const totalCount = useMemo(() => {
    return cartItems.reduce((s, it) => s + (it.quantity ?? 0), 0);
  }, [cartItems]);

  const hasUnsetDates = useMemo(() => {
    return cartItems.some((it) => !it.startDate || !it.endDate);
  }, [cartItems]);

  const canSubmit = useMemo(() => {
    if (!profile) return false;
    if (!department.departmentType) return false;
    if (!department.departmentName) return false;
    if (cartItems.length === 0) return false;
    if (hasUnsetDates) return false;
    return true;
  }, [
    profile,
    department.departmentType,
    department.departmentName,
    cartItems.length,
    hasUnsetDates,
  ]);

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      if (!profile) throw new Error("정보를 불러오는 중이에요.");
      if (!department.departmentType || !department.departmentName) {
        throw new Error("소속을 선택해주세요.");
      }
      if (!cartItems.length) throw new Error("신청할 품목이 없어요.");
      if (hasUnsetDates) {
        throw new Error("대여 기간이 설정되지 않은 물품이 있어요.");
      }

      await onSubmit?.({
        departmentType: department.departmentType,
        departmentName: department.departmentName,
        cartItems,
        profile,
        mode,
        editRentalId,
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "신청에 실패했어요.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!open) return null;

  function ymd(isoOrYmd: string) {
    return String(isoOrYmd).slice(0, 10);
  }

  function fmtRange(start: string | null, end: string | null) {
    if (!start || !end) return "-";
    return `${ymd(start)} ~ ${ymd(end)}`;
  }

  const title = mode === "edit" ? "예약 정보 수정" : "신청 정보 확인";
  const cta = mode === "edit" ? "✓ 위 정보로 수정하기" : "✓ 위 정보로 신청하기";

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
        onConfirm={(next) => setDepartment(next)}
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
          <div className="flex items-center justify-between bg-[#001A37] px-4 sm:px-6 py-3 sm:py-4">
            <div className="text-[18px] sm:text-[clamp(20px,3vw,30px)] font-bold text-white">
              {title}
            </div>
            <button type="button" onClick={onClose} className="p-1.5 sm:p-2">
              <img src={cancel} alt="닫기" className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <div className="flex max-h-[calc(86dvh-64px)] flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
              {/* 에러/로딩 */}
              {(profileLoading || metaLoading || itemsLoading) && (
                <div className="mb-4 text-xs sm:text-sm text-black/50">
                  불러오는 중…
                </div>
              )}
              {profileError && (
                <div className="mb-3 text-xs sm:text-sm text-red-600">
                  {profileError}
                </div>
              )}
              {itemsError && (
                <div className="mb-3 text-xs sm:text-sm text-red-600">
                  {itemsError}
                </div>
              )}

              {/* 사용자 정보 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs sm:text-sm font-semibold text-black/70">
                    이름
                  </div>
                  <input
                    value={profile?.name ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs sm:text-sm font-semibold text-black/70">
                    학번
                  </div>
                  <input
                    value={(profile as any)?.studentId ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs sm:text-sm font-semibold text-black/70">
                    전화번호
                  </div>
                  <input
                    value={(profile as any)?.phoneNumber ?? ""}
                    disabled
                    className="w-full rounded-xl bg-[#A2A2A2] px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] text-[#666] outline-none"
                  />
                </div>

                <div>
                  <div className="mb-2 text-xs sm:text-sm font-semibold text-black/70">
                    소속단위
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeptPickerOpen(true)}
                    disabled={metaLoading || deptTypeOptions.length === 0}
                    className={[
                      "w-full rounded-xl bg-[#EDEDED] px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[13px] sm:text-[15px] text-black outline-none",
                      "disabled:opacity-60",
                    ].join(" ")}
                  >
                    {department.departmentType && department.departmentName
                      ? `${department.departmentType} / ${department.departmentName}`
                      : "선택"}
                  </button>

                  <div className="mt-2 text-[11px] sm:text-xs text-black/50">
                    클릭해서 소속을 선택해주세요.
                  </div>
                </div>
              </div>

              {/* 대여 품목 */}
              <div className="mt-6">
                <div className="mb-3 text-xs sm:text-sm font-semibold text-black/70">
                  대여 품목
                </div>
                <div className="rounded-2xl bg-black/5 p-3 sm:p-4">
                  {!itemsLoading && !itemsError && cartItems.length === 0 && (
                    <div className="text-xs sm:text-sm text-black/50">
                      {mode === "edit"
                        ? "수정할 품목이 없어요."
                        : "장바구니가 비어있어요."}
                    </div>
                  )}

                  {!itemsLoading && !itemsError && cartItems.length > 0 && (
                    <>
                      <div className="space-y-2">
                        {cartItems.map((it) => (
                          <div
                            key={`${it.itemId}-${it.name}`}
                            className="grid grid-cols-3 items-center gap-2 sm:gap-4 py-2"
                          >
                            <div className="text-left min-w-0 truncate text-[13px] sm:text-[15px] font-semibold text-black">
                              {it.name}
                            </div>

                            <div className="text-center whitespace-nowrap text-[12px] sm:text-[15px] text-black">
                              {fmtRange(it.startDate, it.endDate)}
                            </div>

                            <div className="text-right whitespace-nowrap text-[13px] sm:text-[15px] font-semibold text-black">
                              {it.quantity}개
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-black/10 pt-3 flex items-center justify-between">
                        <div className="text-[14px] sm:text-[16px] font-bold text-black">
                          총 수량
                        </div>
                        <div className="text-[14px] sm:text-[16px] font-bold text-black">
                          {totalCount}개
                        </div>
                      </div>

                      {hasUnsetDates && (
                        <div className="mt-3 text-[11px] sm:text-xs text-red-600">
                          대여 기간이 설정되지 않은 물품이 있어요. 기간을 선택한
                          뒤 다시 시도해주세요.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* edit 모드 안내 */}
              {mode === "edit" && (
                <div className="mt-4 rounded-xl bg-orange-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-orange-800">
                  현재는 <b>예약 수정</b> 모드예요. 확인 후 “수정하기”를 누르면
                  기존 예약이 갱신됩니다.
                </div>
              )}
            </div>

            {/* 하단 고정 버튼 */}
            <div className="shrink-0 border-t border-black/10 bg-white px-4 sm:px-6 py-4 sm:py-5">
              <button
                type="button"
                disabled={!canSubmit || submitLoading}
                className="w-full rounded-xl bg-[#F72] px-4 py-3 sm:py-4 text-[14px] sm:text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(254,105,73,0.35)] disabled:opacity-40"
                onClick={handleSubmit}
              >
                {submitLoading
                  ? mode === "edit"
                    ? "수정 중..."
                    : "예약 중..."
                  : cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
