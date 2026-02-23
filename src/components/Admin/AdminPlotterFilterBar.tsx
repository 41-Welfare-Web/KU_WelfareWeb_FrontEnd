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
    <div className="relative w-[1089px] h-[77px]">
      {/* Background container */}
      <div className="absolute bg-white border border-[#c3c3c3] border-solid h-[77px] left-0 rounded-[10px] top-0 w-[1089px]" />
      
      {/* Filter icon */}
      <div className="absolute left-[16px] w-[32px] h-[32px] top-[23px]">
        <img alt="filter" className="absolute block max-w-none w-full h-full" src={filterIcon} />
      </div>
      
      {/* Status dropdown */}
      <div className="absolute h-[31px] left-[55px] top-[22px] w-[98px]">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="absolute bg-white border border-[#a6a6a6] border-solid h-[31px] left-0 rounded-[10px] top-0 w-[98px] flex items-center justify-between px-[9px] cursor-pointer hover:bg-gray-50"
        >
          <span className="font-['Gmarket_Sans'] font-medium text-[15px] text-black">
            {selectedStatus || '전체 상태'}
          </span>
          <svg
            className="w-[12px] h-[12px] transform rotate-90"
            viewBox="0 0 12 24"
            fill="none"
          >
            <path d="M8 6L4 12L8 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-[35px] left-0 w-[98px] bg-white border border-[#a6a6a6] rounded-[10px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className="w-full text-left px-[9px] py-2 text-[15px] font-['Gmarket_Sans'] font-medium hover:bg-gray-100 first:rounded-t-[10px] last:rounded-b-[10px]"
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Search input area */}
      <div className="absolute h-[40px] left-[169px] top-[19px] w-[823px]">
        <div className="absolute bg-[#d9d9d9] h-[40px] left-0 rounded-[10px] top-0 w-[823px]" />
        
        {/* Search icon */}
        <div className="absolute left-[9px] w-[28px] h-[28px] top-[7px]">
          <img alt="search" className="absolute block max-w-none w-full h-full" src={searchIcon} />
        </div>
        
        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={searchPlaceholder}
          className="absolute left-[44px] top-0 h-[40px] w-[770px] bg-transparent border-none outline-none font-['HanbatGothic'] font-medium text-[20px] text-black placeholder:text-[#8e8e8e] tracking-[0.6px]"
        />
      </div>
      
      {/* Search button */}
      <button
        onClick={onSearch}
        className="absolute h-[40px] left-[1006px] top-[19px] w-[69px] bg-black rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
      >
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-white tracking-[0.6px]">
          검색
        </span>
      </button>
    </div>
  );
};

export default AdminPlotterFilterBar;
