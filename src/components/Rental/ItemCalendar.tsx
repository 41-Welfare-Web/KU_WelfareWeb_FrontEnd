import { useState } from "react";
import Calendar from "./Calendar";
import calendar from "../../assets/rental/calendar.svg";

type Props = {
  itemId: number;
  maxQuantity: number; // totalQuantity or currentStock
  className?: string;
  onChange?: (value: {
    startDate: string | null;
    endDate: string | null;
    quantity: number;
  }) => void;
};

export default function ItemCalendarPlaceholder({
  itemId,
  maxQuantity,
  className,
  onChange,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [range, setRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const increase = () => {
    setQuantity((prev) => {
      const next = Math.min(prev + 1, maxQuantity);
      onChange?.({ ...range, quantity: next });
      return next;
    });
  };

  const decrease = () => {
    setQuantity((prev) => {
      const next = Math.max(prev - 1, 1);
      onChange?.({ ...range, quantity: next });
      return next;
    });
  };

  const handleRangeChange = (next: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    setRange(next);
    onChange?.({ ...next, quantity });
  };

  return (
    <div className={["rounded-2xl bg-white p-4", className ?? ""].join(" ")}>
      {/* 타이틀 */}
      <div className="flex items-center gap-2 text-[20px] text-[#410F07]">
        <img src={calendar} alt="캘린더" />
        <span>월간 재고 현황</span>
      </div>

      {/* 실제 캘린더 */}
      <div className="mt-4">
        <Calendar
          itemId={itemId}
          requestedQty={quantity}
          value={range}
          onChange={handleRangeChange}
        />
      </div>

      {/* 수량 선택 */}
      <div className="mt-5 flex items-center justify-between">
        <div className="text-[18px] text-[#410F07]">대여 수량</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrease}
            className="h-7 w-7 rounded-md bg-black/5 hover:bg-black/10"
          >
            -
          </button>

          <div className="min-w-[24px] text-center text-[14px] font-semibold">
            {quantity}
          </div>

          <button
            type="button"
            onClick={increase}
            className="h-7 w-7 rounded-md bg-black/5 hover:bg-black/10"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
