import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createHolidayRange,
  deleteHoliday,
  deleteHolidayRange,
  getHolidays,
  toDateKey,
  type Holiday,
} from "../../api/admin/holidayApi";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-11-30" -> 요일 (UTC 기준 저장이라 UTC로 읽어야 하루 밀리지 않음) */
const dowOf = (dateKey: string) =>
  DOW[new Date(`${dateKey}T00:00:00.000Z`).getUTCDay()];

const isWeekend = (dateKey: string) => {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return day === 0 || day === 6;
};

/** 시작~종료 사이 평일 수 (등록 전 미리보기용) */
const countWeekdays = (start: string, end: string) => {
  if (!start || !end || end < start) return 0;
  let count = 0;
  for (
    let t = +new Date(`${start}T00:00:00.000Z`);
    t <= +new Date(`${end}T00:00:00.000Z`);
    t += 86400000
  ) {
    if (!isWeekend(new Date(t).toISOString().slice(0, 10))) count++;
  }
  return count;
};

const todayKey = () => new Date().toLocaleDateString("en-CA");

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message?.toString() ||
  (err instanceof Error ? err.message : "") ||
  fallback;

export default function AdminHolidayPanel() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHolidays(await getHolidays());
    } catch (err) {
      setError(errorMessage(err, "휴무일을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const preview = countWeekdays(startDate, endDate);
  const invalidRange = Boolean(startDate && endDate && endDate < startDate);

  /** 월(YYYY-MM)별로 묶기 */
  const grouped = useMemo(() => {
    const today = todayKey();
    const rows = holidays
      .map((h) => ({ ...h, key: toDateKey(h.holidayDate) }))
      .filter((h) => (showPast ? true : h.key >= today))
      .sort((a, b) => a.key.localeCompare(b.key));

    const map = new Map<string, typeof rows>();
    rows.forEach((row) => {
      const ym = row.key.slice(0, 7);
      map.set(ym, [...(map.get(ym) ?? []), row]);
    });
    return [...map.entries()];
  }, [holidays, showPast]);

  const handleCreateRange = async () => {
    if (!startDate || !endDate || invalidRange || submitting) return;
    const label = description.trim() || "휴무";
    if (
      !window.confirm(
        `${startDate} ~ ${endDate} 사이 평일 ${preview}일을 '${label}'(으)로 등록할까요?\n` +
          "주말은 자동 휴무라 등록하지 않습니다.",
      )
    )
      return;

    setSubmitting(true);
    try {
      const res = await createHolidayRange({
        startDate,
        endDate,
        description: description.trim() || undefined,
      });
      await load();
      setStartDate("");
      setEndDate("");
      setDescription("");
      alert(
        `${res.created}일을 등록했습니다.\n` +
          `주말 제외: ${res.weekendsSkipped}일` +
          (res.alreadyRegistered
            ? `\n이미 등록돼 있어 건너뜀: ${res.alreadyRegistered}일 (기존 사유 유지)`
            : ""),
      );
    } catch (err) {
      alert(errorMessage(err, "등록에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDay = async (holiday: Holiday & { key: string }) => {
    if (submitting) return;
    if (!window.confirm(`${holiday.key} 휴무일을 삭제할까요?`)) return;
    setSubmitting(true);
    try {
      await deleteHoliday(holiday.id);
      await load();
    } catch (err) {
      alert(errorMessage(err, "삭제에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMonth = async (ym: string, count: number) => {
    if (submitting) return;
    const [year, month] = ym.split("-").map(Number);
    const last = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    if (
      !window.confirm(
        `${year}년 ${month}월에 등록된 휴무일 ${count}일을 모두 삭제할까요?`,
      )
    )
      return;

    setSubmitting(true);
    try {
      const res = await deleteHolidayRange(`${ym}-01`, last);
      await load();
      alert(`${res.deleted}일을 삭제했습니다.`);
    } catch (err) {
      alert(errorMessage(err, "삭제에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* 기간 등록 */}
      <div className="bg-white border border-[#D9D9D9] rounded-[10px] p-4 sm:p-5 mb-5">
        <h3 className="font-['Gmarket_Sans'] font-bold text-[16px] text-[#410f07] mb-1">
          기간 등록
        </h3>
        <p className="font-['Gmarket_Sans'] text-[13px] text-[#8E8E8E] mb-4">
          시작일과 종료일 사이 <b>평일</b>을 한 번에 휴무일로 등록합니다. 주말은
          이미 자동 휴무라 등록하지 않습니다.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-['Gmarket_Sans'] text-[12px] text-[#8E8E8E]">
              시작일
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-[38px] px-3 rounded-[8px] border border-[#D9D9D9] font-['Gmarket_Sans'] text-[14px] text-[#410f07] outline-none focus:border-[#FE6949]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-['Gmarket_Sans'] text-[12px] text-[#8E8E8E]">
              종료일
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-[38px] px-3 rounded-[8px] border border-[#D9D9D9] font-['Gmarket_Sans'] text-[14px] text-[#410f07] outline-none focus:border-[#FE6949]"
            />
          </label>
          <label className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="font-['Gmarket_Sans'] text-[12px] text-[#8E8E8E]">
              사유 (달력에 표시됩니다)
            </span>
            <input
              type="text"
              value={description}
              maxLength={100}
              placeholder="예: 겨울방학 대여 휴무"
              onChange={(e) => setDescription(e.target.value)}
              className="h-[38px] px-3 rounded-[8px] border border-[#D9D9D9] font-['Gmarket_Sans'] text-[14px] text-[#410f07] placeholder:text-[#C3C3C3] outline-none focus:border-[#FE6949]"
            />
          </label>
          <button
            type="button"
            onClick={handleCreateRange}
            disabled={!startDate || !endDate || invalidRange || submitting}
            className="h-[38px] px-5 shrink-0 rounded-[8px] bg-[#FE6949] text-white font-['Gmarket_Sans'] font-bold text-[14px] hover:bg-[#e85a3c] disabled:bg-[#C3C3C3] disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "처리 중..." : "등록"}
          </button>
        </div>

        {invalidRange && (
          <p className="mt-2 font-['Gmarket_Sans'] text-[13px] text-[#d72002]">
            종료일이 시작일보다 빠릅니다.
          </p>
        )}
        {!invalidRange && startDate && endDate && (
          <p className="mt-2 font-['Gmarket_Sans'] text-[13px] text-[#1F7A34]">
            평일 {preview}일이 등록됩니다.
          </p>
        )}
      </div>

      {/* 등록된 휴무일 */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-['Gmarket_Sans'] text-[13px] text-[#8E8E8E]">
          등록된 휴무일 {holidays.length}일 (주말 제외)
        </span>
        <button
          type="button"
          onClick={() => setShowPast((v) => !v)}
          className="h-[32px] px-3 rounded-[8px] border border-[#a4a4a4] bg-white font-['Gmarket_Sans'] font-medium text-[13px] text-[#410f07] hover:bg-gray-50 transition-colors"
        >
          {showPast ? "지난 휴무일 숨기기" : "지난 휴무일 보기"}
        </button>
      </div>

      <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-hidden">
        {loading && (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            로딩 중...
          </div>
        )}
        {!loading && error && (
          <div className="h-[200px] flex items-center justify-center text-red-500">
            {error}
          </div>
        )}
        {!loading && !error && grouped.length === 0 && (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            {showPast
              ? "등록된 휴무일이 없습니다."
              : "앞으로 예정된 휴무일이 없습니다."}
          </div>
        )}

        {!loading &&
          !error &&
          grouped.map(([ym, rows]) => {
            const [year, month] = ym.split("-").map(Number);
            return (
              <div key={ym} className="border-b border-[#EDEDED] last:border-b-0">
                <div className="flex items-center justify-between px-4 h-[44px] bg-[#FAFAFA]">
                  <span className="font-['Gmarket_Sans'] font-bold text-[14px] text-[#410f07]">
                    {year}년 {month}월
                    <span className="ml-2 font-normal text-[13px] text-[#8E8E8E]">
                      {rows.length}일
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMonth(ym, rows.length)}
                    disabled={submitting}
                    className="h-[28px] px-2.5 rounded-[6px] border border-[#D9D9D9] bg-white font-['Gmarket_Sans'] text-[12px] text-[#d72002] hover:bg-[#FFF5F2] hover:border-[#d72002] disabled:opacity-50 transition-colors"
                  >
                    이 달 전체 삭제
                  </button>
                </div>

                <ul className="divide-y divide-[#F4F4F4]">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 px-4 h-[42px] hover:bg-[#FFFBF9] transition-colors"
                    >
                      <span className="font-['Noto_Sans'] font-medium text-[14px] text-[#410f07] w-[120px] shrink-0">
                        {row.key} ({dowOf(row.key)})
                      </span>
                      <span className="flex-1 min-w-0 truncate font-['Gmarket_Sans'] font-light text-[13px] text-[#8E8E8E]">
                        {row.description || "-"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDay(row)}
                        disabled={submitting}
                        aria-label={`${row.key} 휴무일 삭제`}
                        className="shrink-0 w-[26px] h-[26px] rounded-full text-[#8E8E8E] hover:bg-[#FBE3DF] hover:text-[#d72002] disabled:opacity-40 transition-colors"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
}
