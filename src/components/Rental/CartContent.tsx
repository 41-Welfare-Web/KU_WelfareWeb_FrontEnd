import type { ReactNode } from "react";
import cart from "../../assets/rental/cart.svg";
import cancel from "../../assets/rental/cancel.svg";

type CartItem = {
  id: string | number;
  name: string;
  count: number;
  imageUrl?: string;
};

type Props = {
  items: CartItem[];
  onGoCheckout: () => void;
  headerRight?: ReactNode; // 모바일에서 닫기 버튼 넣고 싶을 때
};

export default function CartContent({
  items,
  onGoCheckout,
  headerRight,
}: Props) {
  const totalCount = items.reduce((sum, it) => sum + it.count, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <img src={cart} alt="장바구니" />
          <span className="text-[23px] font-semibold text-[#410F07]">
            내 장바구니
          </span>
        </div>
        {headerRight}
      </div>

      <div className="px-4 pt-3 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-[13px] text-black/60">
            장바구니가 비어있어요.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-[0_2px_2px_rgba(0,0,0,0.25)]"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#F5F5F5] border border-[#F72]">
                  {it.imageUrl ? (
                    <img
                      src={it.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1">
                  <div className="flex flex-row justify-between">
                    <div className="text-[18px] font-semibold text-[#410F07]">
                      {it.name}
                    </div>
                    <button type="button" className="mr-1">
                      <img className="w-3 h-3" src={cancel} alt="취소" />
                    </button>
                  </div>
                  <div className="text-[15px] text-[#727272]">{it.count}개</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between text-[18px] text-[#410F07]">
          <span className="font-semibold">총 수량</span>
          <span className="font-semibold text-[#FE6949]">{totalCount}개</span>
        </div>

        <button
          type="button"
          onClick={onGoCheckout}
          disabled={items.length === 0}
          className="mt-3 w-full rounded-lg bg-[#FE6949] px-4 py-3 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          대여 신청하러 가기
        </button>
      </div>
    </div>
  );
}
