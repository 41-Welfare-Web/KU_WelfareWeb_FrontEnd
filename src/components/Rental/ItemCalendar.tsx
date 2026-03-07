import { useState, useRef, useEffect } from "react";
import Calendar from "./Calendar";
import calendar from "../../assets/rental/calendar.svg";

type Props = {
  itemId: number;
  maxQuantity: number;
  className?: string;
  onChange?: (value: {
    startDate: string | null;
    endDate: string | null;
    quantity: number;
  }) => void;
};

export default function ItemCalendar({
  itemId,
  maxQuantity,
  className,
  onChange,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  const [range, setRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.({ ...range, quantity });
  }, [range.startDate, range.endDate, quantity]);

  const increase = () => {
    setQuantity((prev) => {
      const next = Math.min(prev + 1, maxQuantity);
      setInputValue(String(next));
      onChange?.({ ...range, quantity: next });
      return next;
    });
  };

  const decrease = () => {
    setQuantity((prev) => {
      const next = Math.max(prev - 1, 1);
      setInputValue(String(next));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 빈 문자열은 입력 중 상태로 허용
    if (raw === "") {
      setInputValue("");
      return;
    }

    // 숫자만 허용
    if (!/^\d+$/.test(raw)) return;

    setInputValue(raw);
  };

  const applyInputValue = () => {
    let value = Number(inputValue);

    if (!inputValue || isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > maxQuantity) value = maxQuantity;

    setQuantity(value);
    setInputValue(String(value));
    onChange?.({ ...range, quantity: value });
  };

  return (
    <div className={["rounded-2xl bg-white p-4", className ?? ""].join(" ")}>
      <div className="flex items-center gap-2 text-[20px] text-[#410F07]">
        <img src={calendar} alt="캘린더" />
        <span>월간 재고 현황</span>
      </div>

      <div className="mt-4">
        <Calendar
          itemId={itemId}
          requestedQty={quantity}
          value={range}
          onChange={handleRangeChange}
        />
      </div>

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

          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={applyInputValue}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyInputValue();
                e.currentTarget.blur();
              }
            }}
            className="w-[50px] text-center text-[14px] font-semibold border border-black/10 rounded-md py-1"
          />

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
