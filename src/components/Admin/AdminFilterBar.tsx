import searchIcon from '../../assets/admin/glass.svg';

interface AdminFilterBarProps {
  // 상태 필터
  statusOptions: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  
  // 날짜 범위
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  
  // 검색
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
}

export default function AdminFilterBar({
  statusOptions,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchPlaceholder = "이름, 학과, 물품 검색"
}: AdminFilterBarProps) {
  return (
    <div className="relative w-full bg-white border border-[#c3c3c3] rounded-[10px] px-4 md:px-[37px] py-3 md:py-[19px] flex flex-col gap-3">
      {/* 상단: 상태 필터 버튼들 */}
      <div className="flex flex-wrap gap-[8px] md:gap-[11px]">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`h-[28px] md:h-[29px] px-[12px] md:px-[23px] py-[5px] md:py-[7px] rounded-[10px] font-['Gmarket_Sans'] font-medium text-[12px] md:text-[14px] leading-normal flex items-center justify-center ${
              selectedStatus === status
                ? 'bg-[#fe6949] text-white'
                : 'bg-white border border-[#afafaf] text-black'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 하단: 날짜 범위, 검색창 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-[23px]">
        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-2 sm:gap-[21px]">
          {/* 시작일 */}
          <input
            type="date"
            value={startDate}
            min="2026-01-01"
            max="2026-12-31"
            onChange={(e) => {
              let val = e.target.value;
              if (val < '2026-01-01') val = '2026-01-01';
              if (val > '2026-12-31') val = '2026-12-31';
              onStartDateChange(val);
            }}
            className="flex-1 min-w-0 sm:w-[120px] h-[38px] md:h-[40px] bg-[#e6e6e6] rounded-[5px] px-[7px] text-[13px] md:text-[16px] font-['Gmarket_Sans'] font-light text-black appearance-none"
            style={{ colorScheme: 'light', minWidth: 0 }}
          />

          {/* 구분자 */}
          <span className="text-[20px] md:text-[30px] font-bold text-black flex-shrink-0">~</span>

          {/* 종료일 */}
          <input
            type="date"
            value={endDate}
            min="2026-01-01"
            max="2026-12-31"
            onChange={(e) => {
              let val = e.target.value;
              if (val < '2026-01-01') val = '2026-01-01';
              if (val > '2026-12-31') val = '2026-12-31';
              onEndDateChange(val);
            }}
            className="flex-1 min-w-0 sm:w-[120px] h-[38px] md:h-[40px] bg-[#e6e6e6] rounded-[5px] px-[7px] text-[13px] md:text-[16px] font-['Gmarket_Sans'] font-light text-black appearance-none"
            style={{ colorScheme: 'light', minWidth: 0 }}
          />
        </div>

        {/* 검색창 + 버튼 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 min-w-0 bg-[#eaeaea] rounded-[10px] h-[38px] md:h-[40px] flex items-center px-[7px] gap-[7px]">
            <img src={searchIcon} alt="검색" className="w-5 h-5 md:w-[28px] md:h-[28px] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') onSearch();
              }}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none font-['HanbatGothic'] font-medium text-[14px] md:text-[20px] text-[#8e8e8e] placeholder:text-[#8e8e8e] min-w-0"
            />
          </div>
          <button
            onClick={onSearch}
            className="bg-black text-white rounded-[10px] h-[38px] md:h-[40px] min-w-[50px] w-[60px] md:w-[69px] font-['HanbatGothic'] font-medium text-[14px] md:text-[20px]"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
