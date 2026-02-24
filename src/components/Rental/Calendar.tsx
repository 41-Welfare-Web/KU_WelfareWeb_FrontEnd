import { useEffect, useMemo, useState } from "react";
import { getItemAvailability } from "../../api/rental/calendar";
import type { Availability } from "../../api/rental/types";

type Props = {
  itemId: number;
  requestedQty: number;
  value?: { startDate: string | null; endDate: string | null };
  onChange?: (next: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function isSameYmd(a: string | null, b: string | null) {
  return !!a && !!b && a === b;
}
function isBetween(target: string, start: string, end: string) {
  return target >= start && target <= end;
}
function getMonthGrid(viewYear: number, viewMonthIndex0: number) {
  const first = new Date(viewYear, viewMonthIndex0, 1);
  const last = new Date(viewYear, viewMonthIndex0 + 1, 0);

  const firstDow = first.getDay(); // 0..6
  const offset = (firstDow + 6) % 7; // Monday start
  const start = new Date(first);
  start.setDate(first.getDate() - offset);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === viewMonthIndex0 });
  }
  return { first, last, cells };
}
function addMonths(year: number, monthIndex0: number, delta: number) {
  const d = new Date(year, monthIndex0 + delta, 1);
  return { year: d.getFullYear(), monthIndex0: d.getMonth() };
}

export default function AvailabilityCalendar({
  itemId,
  requestedQty,
  value,
  onChange,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [startDate, setStartDate] = useState<string | null>(
    value?.startDate ?? null,
  );
  const [endDate, setEndDate] = useState<string | null>(value?.endDate ?? null);

  useEffect(() => {
    if (!value) return;
    setStartDate(value.startDate ?? null);
    setEndDate(value.endDate ?? null);
  }, [value?.startDate, value?.endDate]);

  const { first, last, cells } = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthStartYmd = useMemo(() => toYmd(first), [first]);
  const monthEndYmd = useMemo(() => toYmd(last), [last]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Availability[]>([]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await getItemAvailability({
          itemId,
          startDate: monthStartYmd,
          endDate: monthEndYmd,
        });
        if (!alive) return;
        setData(result);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "재고 조회에 실패했어요.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [itemId, monthStartYmd, monthEndYmd]);

  const mapByDate = useMemo(() => {
    const m = new Map<string, Availability>();
    data.forEach((row) => m.set(row.date, row));
    return m;
  }, [data]);

  const commit = (next: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    onChange?.(next);
  };

  const onPickDay = (ymd: string) => {
    if (!startDate) {
      commit({ startDate: ymd, endDate: null });
      return;
    }
    if (!endDate) {
      if (ymd < startDate) {
        commit({ startDate: ymd, endDate: null });
        return;
      }
      commit({ startDate, endDate: ymd });
      return;
    }
    commit({ startDate: ymd, endDate: null });
  };

  const goPrev = () => {
    const next = addMonths(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.monthIndex0);
  };
  const goNext = () => {
    const next = addMonths(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.monthIndex0);
  };

  return (
    <div className="w-full rounded-2xl bg-[#F5F5F5] shadow-[0_10px_24px_rgba(0,0,0,0.10)] border border-black/10 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="h-10 w-10 rounded-full bg-white hover:bg-black/10 flex items-center justify-center"
          aria-label="이전 달"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-white font-semibold">
            {viewMonth + 1}월
          </div>
          <div className="px-3 py-2 rounded-xl bg-white font-semibold">
            {viewYear}
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          className="h-10 w-10 rounded-full bg-white hover:bg-black/10 flex items-center justify-center"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="mt-2 text-[12px] text-black/50">
        {loading ? "불러오는 중…" : ""}
        {error ? ` ${error}` : ""}
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[13px] font-semibold text-black/70">
        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const ymd = toYmd(cell.date);
          const inMonth = cell.inMonth;

          const av = mapByDate.get(ymd);
          const available = av?.availableQuantity ?? null;
          const enough = available != null ? available >= requestedQty : null;

          const isStart = isSameYmd(ymd, startDate);
          const isEnd = isSameYmd(ymd, endDate);
          const inRange =
            startDate && endDate ? isBetween(ymd, startDate, endDate) : false;

          let base =
            "bg-white border border-black/10 hover:bg-black/5 text-black";
          if (!inMonth) base = "bg-transparent text-black/25";
          else if (enough === true) base = "bg-emerald-100 text-black";
          else if (enough === false) base = "bg-[#FFA2A2] text-[#FF0000]";

          let selected = "";
          if (inRange) selected = "bg-orange-500 text-white";
          if (isStart || isEnd) selected = "bg-orange-500 text-white";

          return (
            <button
              key={ymd}
              type="button"
              onClick={() => inMonth && onPickDay(ymd)}
              disabled={!inMonth}
              className={[
                "rounded-xl p-2 text-left transition",
                "min-h-[64px] md:min-h-[72px]",
                base,
                selected,
              ].join(" ")}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-[18px] font-bold leading-none">
                  {cell.date.getDate()}
                </div>

                {inMonth && available != null && (
                  <div className="whitespace-nowrap text-[8px] font-semibold px-2 py-1 rounded-full">
                    {available}개
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-black/5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-[13px] text-black/60">대여일</div>
            <div className="mt-1 text-[18px] font-bold">{startDate ?? "—"}</div>
          </div>
          <div className="text-center border-l border-black">
            <div className="text-[13px] text-black/60">반납일</div>
            <div className="mt-1 text-[18px] font-bold">{endDate ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
