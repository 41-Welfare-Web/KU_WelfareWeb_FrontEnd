import { useEffect, useState } from "react";
import cancel from "../../assets/rental/cancel.svg";

type Status = "WAIT" | "OK" | "NO";

export type RentalCartRowItem = {
  cartId: number;
  itemId: number;
  name: string;
  categoryName?: string;
  count: number;
  totalQuantity: number;
  imageUrl?: string;
  startDate: string | null;
  endDate: string | null;
};

type Props = {
  item: RentalCartRowItem;
  selected?: boolean;
  status: Status;
  onSelect: () => void;
  onRemove: () => void;
  onChangeQty: (nextQty: number) => void;
};

function toMMDD(ymd: string) {
  const m = Number(ymd.slice(5, 7));
  const d = ymd.slice(8, 10);
  return `${m}.${d}`;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "WAIT") {
    return (
      <span className="px-2 py-1 rounded-md bg-[#D9D9D9] text-[#555] text-[10px] sm:text-[12px] font-semibold">
        기간 선택 대기
      </span>
    );
  }
  if (status === "OK") {
    return (
      <span className="px-2 py-1 rounded-md bg-[#A6F4A6] text-[#0A7A0A] text-[10px] sm:text-[12px] font-semibold">
        ✓ 대여 가능
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-md bg-[#FFA2A2] text-[#B00000] text-[10px] sm:text-[12px] font-semibold">
      대여 불가
    </span>
  );
}

export default function RentalCartItemRow({
  item,
  selected,
  status,
  onSelect,
  onRemove,
  onChangeQty,
}: Props) {
  const hasDates = !!item.startDate && !!item.endDate;
  const [inputValue, setInputValue] = useState(String(item.count));
  const maxQty = Math.max(1, item.totalQuantity);

  useEffect(() => {
    setInputValue(String(item.count));
  }, [item.count]);

  const increase = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChangeQty(Math.min(maxQty, item.count + 1));
  };

  const decrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChangeQty(Math.max(1, item.count - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const raw = e.target.value;

    if (raw === "") {
      setInputValue("");
      return;
    }

    if (!/^\d+$/.test(raw)) return;
    setInputValue(raw);
  };

  const applyInputValue = () => {
    let value = Number(inputValue);

    if (!inputValue || isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > maxQty) value = maxQty;

    setInputValue(String(value));

    if (value !== item.count) {
      onChangeQty(value);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={[
        "w-full text-left rounded-2xl border border-black/10",
        "px-3 sm:px-4 py-3",
        "relative",
        "transition",
        selected ? "bg-[#D7D7D7]" : "bg-[#EFEFEF]",
        "hover:bg-[#E3E3E3]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="
          absolute top-2 right-2
          grid place-items-center
          w-8 h-8 sm:w-9 sm:h-9
          rounded-full
          hover:bg-black/10
          transition
          z-10
        "
        aria-label="삭제"
      >
        <img
          src={cancel}
          alt="취소"
          className="block w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none"
        />
      </button>

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-white overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1 min-w-0 relative">
          <div className="pr-8">
            <div className="text-[#FE6949] font-bold text-[10px] sm:text-[12px]">
              {item.categoryName ?? ""}
            </div>

            <div className="mt-0.5 text-[#3B160D] font-extrabold text-[15px] sm:text-[clamp(16px,1.8vw,22px)] leading-tight truncate">
              {item.name}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-1 rounded-md bg-white text-[#3B160D] text-[10px] sm:text-[12px] font-semibold">
                {hasDates
                  ? `${toMMDD(item.startDate!)} ~ ${toMMDD(item.endDate!)}`
                  : "기간 미선택"}
              </span>
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-3 flex justify-end items-center gap-1.5 sm:gap-2">
            <div className="text-[#3B160D] text-[11px] sm:text-[13px] font-semibold">
              수량
            </div>

            <div className="flex items-center rounded-lg bg-white border border-black/10 overflow-hidden">
              <button
                type="button"
                onClick={decrease}
                disabled={item.count <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-black/5 text-sm sm:text-base disabled:opacity-40"
                aria-label="수량 감소"
              >
                –
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onClick={(e) => e.stopPropagation()}
                onChange={handleInputChange}
                onBlur={applyInputValue}
                onFocus={(e) => {
                  e.stopPropagation();
                  e.target.select();
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    applyInputValue();
                    e.currentTarget.blur();
                  }
                }}
                className="w-8 sm:w-10 h-7 sm:h-8 text-center text-[11px] sm:text-[13px] font-bold bg-transparent outline-none"
                aria-label="수량 입력"
              />

              <button
                type="button"
                onClick={increase}
                disabled={item.count >= maxQty}
                className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-black/5 text-sm sm:text-base disabled:opacity-40"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>

            <div className="text-[#3B160D] text-[11px] sm:text-[13px]">개</div>
          </div>
        </div>
      </div>
    </div>
  );
}
