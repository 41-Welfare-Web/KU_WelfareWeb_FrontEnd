import searchIcon from '../../assets/admin/glass.svg';
import calendarIcon from '../../assets/admin/calendar.svg';

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
    <div className="relative w-full bg-white border border-[#c3c3c3] rounded-[10px] h-[117px] px-[37px] py-[19px]">
      {/* 상단: 상태 필터 버튼들 */}
      <div className="flex gap-[11px] mb-[14px]">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
              className={`h-[29px] px-[23px] py-[7px] rounded-[10px] font-['Gmarket_Sans'] font-medium text-[14px] leading-normal flex items-center justify-center ${
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
      <div className="flex items-center gap-[23px]">
        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-[21px]">
          {/* 시작일 */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-[120px] h-[40px] bg-[#e6e6e6] rounded-[5px] px-[7px] text-[16px] font-['Gmarket_Sans'] font-light text-black appearance-none"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>

          {/* 구분자 */}
          <span className="text-[30px] font-['Inter '] font-bold text-black">~</span>

          {/* 종료일 */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-[120px] h-[40px] bg-[#e6e6e6] rounded-[5px] px-[7px] text-[16px] font-['Gmarket_Sans'] font-light text-black appearance-none"
              style={{
                colorScheme: 'light',
              }}
            />
          </div>
        </div>

        {/* 검색창 */}
        <div className="flex-1 bg-[#eaeaea] rounded-[10px] h-[40px] flex items-center px-[7px] gap-[7px]">
          <img src={searchIcon} alt="검색" className="w-[28px] h-[28px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none font-['HanbatGothic'] font-medium text-[20px] text-[#8e8e8e] placeholder:text-[#8e8e8e]"
          />
        </div>

        {/* 검색 버튼 */}
        <button
          onClick={onSearch}
          className="bg-black text-white rounded-[10px] h-[40px] w-[69px] font-['HanbatGothic'] font-medium text-[20px]"
        >
          검색
        </button>
      </div>
    </div>
  );
}
