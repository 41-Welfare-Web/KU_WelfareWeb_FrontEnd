import React from 'react';
import filterIcon from '../../assets/admin/filter.svg';
import searchIcon from '../../assets/admin/glass.svg';

interface AdminPlotterFilterBarProps {
  statusOptions: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
}

const AdminPlotterFilterBar: React.FC<AdminPlotterFilterBarProps> = ({
  statusOptions,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchPlaceholder = '이름, 학과, 물품 검색'
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative w-full flex items-center gap-2 px-4 md:px-6 py-3 md:py-0 md:h-[77px] bg-white border border-[#c3c3c3] rounded-[10px]">
      {/* Filter icon - hide on mobile */}
      <div className="hidden md:flex w-[20px] h-[20px] items-center justify-center flex-shrink-0">
        <img alt="filter" className="w-[20px] h-[20px]" src={filterIcon} />
      </div>

      {/* Status dropdown */}
      <div className="relative h-[36px] md:h-[31px] w-[100px] md:w-[98px] flex items-center flex-shrink-0">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white border border-[#a6a6a6] h-[36px] md:h-[31px] w-full flex items-center justify-between px-[9px] rounded-[10px] cursor-pointer hover:bg-gray-50"
        >
          <span className="font-['Gmarket_Sans'] font-medium text-[13px] md:text-[15px] text-black truncate">
            {selectedStatus || '전체 상태'}
          </span>
          <svg
            className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] transform rotate-90 flex-shrink-0"
            viewBox="0 0 12 24"
            fill="none"
          >
            <path d="M8 6L4 12L8 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-[40px] left-0 w-[120px] bg-white border border-[#a6a6a6] rounded-[10px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className="w-full text-left px-[9px] py-2 text-[13px] md:text-[15px] font-['Gmarket_Sans'] font-medium hover:bg-gray-100 first:rounded-t-[10px] last:rounded-b-[10px]"
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search input area */}
      <div className="flex items-center bg-[#d9d9d9] rounded-[10px] h-[36px] md:h-[40px] px-3 flex-1 min-w-0 ml-1 md:ml-2">
        <img alt="search" className="block w-[18px] h-[18px] md:w-[20px] md:h-[20px] mr-2 flex-shrink-0" src={searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent border-none outline-none font-['HanbatGothic'] font-medium text-[14px] md:text-[20px] text-black placeholder:text-[#8e8e8e] min-w-0"
        />
      </div>

      {/* Search button */}
      <button
        onClick={onSearch}
        className="h-[36px] md:h-[40px] w-[60px] md:w-[69px] bg-black rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors flex-shrink-0"
      >
        <span className="font-['HanbatGothic'] font-medium text-[14px] md:text-[20px] text-white">
          검색
        </span>
      </button>
    </div>
  );
};

export default AdminPlotterFilterBar;
