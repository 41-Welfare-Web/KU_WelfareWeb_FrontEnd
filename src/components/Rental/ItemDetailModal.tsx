import { useEffect, useRef, useState } from "react";
import ItemCalendarPlaceholder from "./ItemCalendar";
import type { ItemDetail } from "../../api/rental/types";
import { getItemDetail } from "../../api/rental/rentalApi";

type Props = {
  open: boolean;
  itemId: number | null;
  onClose: () => void;
  onAddToCart?: (item: ItemDetail) => void;
};

export default function ItemDetailModal({
  open,
  itemId,
  onClose,
  onAddToCart,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* left */}
                  <div className="min-w-0 lg:col-span-2">
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

                    <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm text-black/60">
                      사용법 가이드 영상 / 이미지 슬라이더 자리
                    </div>
                  </div>

                  {/* right */}
                  <div className="min-w-0 lg:col-span-3">
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

                    {/* <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-black/60">
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        코드: {data.itemCode}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        대여횟수: {data.rentalCount}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1">
                        재고: {data.currentStock}/{data.totalQuantity}
                      </span>
                    </div> */}

                    <div className="mt-5">
                      <ItemCalendarPlaceholder
                        itemId={data.id}
                        maxQuantity={data.totalQuantity}
                        onChange={({ startDate, endDate, quantity }) => {
                          console.log(startDate, endDate, quantity);
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart?.(data)}
                      className="mt-4 w-full rounded-xl bg-[#FE6949] py-3 text-[15px] font-semibold text-white"
                    >
                      장바구니에 담기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* ✅ /scroll 영역 */}
        </div>
      </div>
    </div>
  );
}
