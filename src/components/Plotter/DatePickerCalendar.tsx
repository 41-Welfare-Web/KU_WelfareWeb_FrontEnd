import { useState, useEffect } from "react";
import { getNextWorkday, getHolidaysList } from "../../utils/dateUtils";

interface DatePickerCalendarProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD format - dates before this are disabled
  className?: string;
}

interface Day {
  date: string; // YYYY-MM-DD
  day: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isToday: boolean;
  isSelected: boolean;
  isBeforeMinDate: boolean;
}

export default function DatePickerCalendar({
  selectedDate,
  onDateChange,
  minDate,
  className = "",
}: DatePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [days, setDays] = useState<Day[]>([]);

  // Initialize with selected date's month
  useEffect(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split('-').map(Number);
      setCurrentMonth({ year, month });
    }
  }, [selectedDate]);

  // Generate calendar days
  useEffect(() => {
    const { year, month } = currentMonth;
    const holidays = getHolidaysList();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse minDate if provided
    const minDateObj = minDate ? new Date(minDate) : null;
    minDateObj?.setHours(0, 0, 0, 0);

    // First day of month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const prevLastDay = new Date(year, month - 1, 0);

    const daysArray: Day[] = [];

    // Previous month's days
    const startDate = firstDay.getDay();
    for (let i = startDate - 1; i >= 0; i--) {
      const date = new Date(prevLastDay);
      date.setDate(prevLastDay.getDate() - i);
      const dateStr = formatDate(date);
      const isBeforeMin = minDateObj ? date < minDateObj : false;
      daysArray.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: false,
        isWeekend: isWeekendDay(date),
        isHoliday: holidays.includes(dateStr),
        isToday: false,
        isSelected: dateStr === selectedDate,
        isBeforeMinDate: isBeforeMin,
      });
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month - 1, i);
      const dateStr = formatDate(date);
      const dayOfWeek = date.getDay();
      const isBeforeMin = minDateObj ? date < minDateObj : false;
      daysArray.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: holidays.includes(dateStr),
        isToday: dateStr === formatDate(today),
        isSelected: dateStr === selectedDate,
        isBeforeMinDate: isBeforeMin,
      });
    }

    // Next month's days
    const remainingDays = 42 - daysArray.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const isBeforeMin = minDateObj ? date < minDateObj : false;
      daysArray.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isWeekend: isWeekendDay(date),
        isHoliday: getHolidaysList().includes(dateStr),
        isToday: false,
        isSelected: dateStr === selectedDate,
        isBeforeMinDate: isBeforeMin,
      });
    }

    setDays(daysArray);
  }, [currentMonth, selectedDate, minDate]);

  const handlePrevMonth = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    
    // 현재 월보다 과거로는 이동 불가
    if (currentMonth.year < todayYear || (currentMonth.year === todayYear && currentMonth.month <= todayMonth)) {
      return;
    }
    
    let newMonth: { year: number; month: number };
    if (currentMonth.month === 1) {
      newMonth = { year: currentMonth.year - 1, month: 12 };
    } else {
      newMonth = { ...currentMonth, month: currentMonth.month - 1 };
    }
    
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    let newMonth: { year: number; month: number };
    if (currentMonth.month === 12) {
      newMonth = { year: currentMonth.year + 1, month: 1 };
    } else {
      newMonth = { ...currentMonth, month: currentMonth.month + 1 };
    }
    
    setCurrentMonth(newMonth);
  };

  // 현재 월보다 과거로 갈 수 없는지 확인
  const canGoPrev = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    return !(currentMonth.year < todayYear || (currentMonth.year === todayYear && currentMonth.month <= todayMonth));
  };

  const handleDateClick = (date: string, isWeekend: boolean, isHoliday: boolean, isBeforeMinDate: boolean) => {
    if (isBeforeMinDate) {
      alert("선택할 수 없는 날짜입니다.");
      return;
    }
    if (isWeekend || isHoliday) {
      // Auto-move to next workday
      const nextWorkday = getNextWorkday(date);
      if (nextWorkday) {
        if (isWeekend) {
          alert("주말은 선택할 수 없습니다. 다음 근무일로 자동 설정됩니다.");
        } else {
          alert("공휴일은 선택할 수 없습니다. 다음 근무일로 자동 설정됩니다.");
        }
        onDateChange(nextWorkday);
      }
      return;
    }
    onDateChange(date);
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className={className}>
      {/* Calendar Header */}
      <div className="bg-[#ffc87c] rounded-t-[10px] p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev()}
          className={`p-2 rounded transition-colors ${canGoPrev() ? 'hover:bg-[#ffb347]' : 'opacity-40 cursor-not-allowed'}`}
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        <h3 className="text-lg font-bold text-black">
          {currentMonth.year}년 {String(currentMonth.month).padStart(2, '0')}월
        </h3>
        
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-[#ffb347] rounded transition-colors"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 15L13 10L8 5" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-[#99a1af] border-t-0 rounded-b-[10px] p-4">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-black h-8 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(dayObj => (
            <button
              key={dayObj.date}
              type="button"
              onClick={() => handleDateClick(dayObj.date, dayObj.isWeekend, dayObj.isHoliday, dayObj.isBeforeMinDate)}
              disabled={!dayObj.isCurrentMonth || dayObj.isWeekend || dayObj.isHoliday || dayObj.isBeforeMinDate}
              className={`
                h-8 flex items-center justify-center text-sm font-medium rounded transition-all
                relative
                ${dayObj.isSelected ? 'bg-orange-400 text-white font-bold text-base scale-110 hover:bg-orange-500' : ''}
                ${!dayObj.isSelected && !dayObj.isCurrentMonth ? 'text-gray-300 bg-white' : ''}
                ${!dayObj.isSelected && dayObj.isBeforeMinDate && dayObj.isCurrentMonth ? 'bg-white text-gray-400 cursor-not-allowed' : ''}
                ${!dayObj.isSelected && dayObj.isCurrentMonth && !dayObj.isWeekend && !dayObj.isHoliday && !dayObj.isBeforeMinDate ? 'bg-white hover:bg-[#fff5e1] text-black cursor-pointer' : ''}
                ${!dayObj.isSelected && dayObj.isWeekend && dayObj.isCurrentMonth ? 'bg-white text-gray-400 cursor-not-allowed' : ''}
                ${!dayObj.isSelected && dayObj.isHoliday && dayObj.isCurrentMonth && !dayObj.isBeforeMinDate ? 'bg-white text-red-500 cursor-not-allowed' : ''}
              `}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isWeekendDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}
