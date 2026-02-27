import { useEffect, useMemo, useState } from "react";
import cancel from "../../assets/rental/cancel-white.svg";

import { getMyProfile } from "../../services/userApi";
import type { UserProfile } from "../../services/userApi";
import { getDepartments } from "../../api/signup/signupApi";
import { getMyCart } from "../../api/rental/cart/cartApi";
import type {
  CartAddResponse,
  CartGetResponse,
} from "../../api/rental/cart/types";

type Unit = { id: number; name: string };

type Props = {
  open: boolean;
  onClose: () => void;

  onSubmit?: (payload: {
    departmentId: number;
    cartItems: CartAddResponse[];
    profile: UserProfile;
  }) => void;
};

export default function RentalConfirmModal({ open, onClose, onSubmit }: Props) {
  // 신청자 정보
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 소속단위
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  const [departmentId, setDepartmentId] = useState<number>(0);

  // 장바구니
  const [cart, setCart] = useState<CartGetResponse | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // open될 때: profile + departments + cart 로드
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

    // 2) departments
    setUnitsLoading(true);
    setUnitsError(null);
    getDepartments()
      .then((list) => {
        console.log("departments list:", list, "len:", list.length);
        if (!alive) return;
        const mapped: Unit[] = list.map((name, idx) => ({
          id: idx + 1,
          name,
        }));

        setUnits(mapped);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setUnitsError(
          e instanceof Error ? e.message : "소속단위를 불러오지 못했어요.",
        );
      })
      .finally(() => {
        if (!alive) return;
        setUnitsLoading(false);
      });

    // 3) cart
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
    if (units.length === 0) return;
    if (departmentId !== 0) return;

    const found = units.find((u) => u.name === profile.departmentType); // 매칭되면 그 id, 아니면 0(선택 없음)
    setDepartmentId(found?.id ?? 0);
  }, [open, profile, units]);

  const cartItems = cart?.items ?? [];
  const totalCount =
    cart?.totalCount ?? cartItems.reduce((s, it) => s + (it.quantity ?? 0), 0);

  const canSubmit = useMemo(() => {
    if (!profile) return false;
    if (!departmentId) return false;
    if (cartItems.length === 0) return false;
    if (cart?.hasUnsetDates) return false;
    return true;
  }, [profile, departmentId, cartItems.length, cart?.hasUnsetDates]);

  if (!open) return null;

  // 날짜 포맷 함수
  function ymd(iso: string) {
    return iso.slice(0, 10);
  }

  function fmtRange(start: string | null, end: string | null) {
    if (!start || !end) return "-";
    return `${ymd(start)} ~ ${ymd(end)}`;
  }

  return (
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
            {(profileLoading || unitsLoading || cartLoading) && (
              <div className="mb-4 text-sm text-black/50">불러오는 중…</div>
            )}
            {profileError && (
              <div className="mb-3 text-sm text-red-600">{profileError}</div>
            )}
            {unitsError && (
              <div className="mb-3 text-sm text-red-600">{unitsError}</div>
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

                <div className="relative">
                  <select
                    value={departmentId || ""}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl bg-[#EDEDED] px-4 py-3 pr-10 text-[15px] text-black outline-none"
                    disabled={unitsLoading || units.length === 0}
                  >
                    <option value="">선택</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/60">
                    ▽
                  </div>
                </div>

                {!!profile?.departmentName && (
                  <div className="mt-2 text-xs text-black/50">
                    소속명: {profile.departmentName}
                    {/* 목록에 없을 때만 추가 문구 */}
                    {!unitsLoading &&
                      units.length > 0 &&
                      !units.some((u) => u.name === profile.departmentType) && (
                        <>
                          <br />
                          현재 소속단위가 목록에 없어 직접 선택해주세요.
                        </>
                      )}
                  </div>
                )}
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
                          {/* 물품이름 */}
                          <div className="text-left min-w-0 truncate text-[15px] font-semibold text-black">
                            {it.item?.name ?? "이름 없음"}
                          </div>

                          {/* 대여일 */}
                          <div className="text-center whitespace-nowrap text-[15px] text-black">
                            {fmtRange(it.startDate, it.endDate)}
                          </div>

                          {/* 수량 */}
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
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#F72] px-4 py-4 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(254,105,73,0.35)] disabled:opacity-40"
              onClick={() => {
                if (!profile || !cart) return;
                onSubmit?.({ departmentId, cartItems, profile });
              }}
            >
              ✓ 위 정보로 신청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
