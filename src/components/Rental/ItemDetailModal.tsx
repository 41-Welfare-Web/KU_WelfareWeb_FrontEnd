import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ItemCalendar from "./ItemCalendar";
import type { ItemDetail } from "../../api/rental/types";
import { getItemDetail } from "../../api/rental/rentalApi";
import guide from "../../assets/rental/guide.svg";
import { addToCart, updateCartItem } from "../../api/rental/cart/cartApi";

type Props = {
  open: boolean;
  itemId: number | null;
  onClose: () => void;
  onAddToCart?: (
    item: ItemDetail,
    picked: {
      startDate: string | null;
      endDate: string | null;
      quantity: number;
    },
  ) => void;
};

export default function ItemDetailModal({
  open,
  itemId,
  onClose,
  onAddToCart,
}: Props) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 캘린더에서 고른 값 저장
  const [picked, setPicked] = useState<{
    startDate: string | null;
    endDate: string | null;
    quantity: number;
  }>({ startDate: null, endDate: null, quantity: 1 });

  // 담기 버튼 로딩(중복 클릭 방지)
  const [adding, setAdding] = useState(false);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    // 모달 내부 스크롤을 항상 맨 위로
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // 모달 열릴 때 선택값 초기화
    setPicked({ startDate: null, endDate: null, quantity: 1 });
  }, [open, itemId]);

  // 상세 로드
  useEffect(() => {
    if (!open || !itemId) return;

    let alive = true;
    setLoading(true);
    setError(null);
    setData(null);

    getItemDetail(itemId)
      .then((res) => {
        if (!alive) return;
        setData(res);

        requestAnimationFrame(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        });
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message ?? "상세 정보를 불러오지 못했어요.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, itemId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* modal wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={boxRef}
          className="
            w-full max-w-[1040px]
            rounded-2xl bg-white
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            overflow-hidden
          "
        >
          <div
            ref={scrollRef}
            className="max-h-[calc(100dvh-32px)] overflow-y-auto"
          >
            {/* header */}
            <div className="sticky top-0 z-10 bg-white flex items-center justify-end px-5 py-4 border-b border-black/5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-black/5 text-[22px] leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* body */}
            <div className="px-6 pb-6">
              {loading && (
                <div className="rounded-xl bg-black/5 p-4 text-sm text-black/60">
                  불러오는 중...
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {data && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-5">
                  {/* 제목 */}
                  <div className="min-w-0 order-1 lg:order-none lg:col-start-3 lg:col-span-3">
                    <div className="text-[13px] font-semibold text-[#FE6949]">
                      {data.category?.name}
                    </div>
                    <div className="mt-1 text-[28px] font-bold text-[#410F07]">
                      {data.name}
                    </div>

                    {data.description && (
                      <div className="mt-2 text-[14px] text-black/70 leading-relaxed">
                        {data.description}
                      </div>
                    )}
                  </div>

                  {/* 왼쪽: 사진&영상 */}
                  <div className="min-w-0 order-2 lg:order-none lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
                      {data.imageUrl ? (
                        <img
                          src={data.imageUrl}
                          alt={data.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-sm text-black/50">이미지 없음</div>
                      )}
                    </div>

                    <div className="flex justify-center items-center rounded-[10px] bg-black text-white text-[12px] mt-4 w-20 h-6">
                      총 {data.totalQuantity}개 보유
                    </div>

                    <div className="mt-2">
                      <div className="flex flex-row gap-2">
                        <img src={guide} alt="가이드 영상" />
                        <span className="text-[#410F07] text-[20px]">
                          사용법 가이드 영상
                        </span>
                      </div>
                      <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
                        사용법 가이드 영상
                      </div>
                    </div>
                  </div>

                  {/* 캘린더 */}
                  <div className="min-w-0 order-3 lg:order-none lg:col-start-3 lg:col-span-3">
                    <div className="mt-2">
                      <ItemCalendar
                        itemId={data.id}
                        maxQuantity={data.totalQuantity}
                        onChange={({ startDate, endDate, quantity }) => {
                          setPicked({ startDate, endDate, quantity });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoggedIn) {
                          alert("로그인이 필요한 서비스입니다.");
                          onClose();
                          navigate("/login");
                          return;
                        }
                        onAddToCart?.(data, picked);
                      }}
                      disabled={adding}
                      className="mt-4 w-full rounded-xl bg-[#FE6949] py-3 text-[15px] font-semibold text-white disabled:opacity-50"
                    >
                      {adding ? "담는 중..." : "장바구니에 담기"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
