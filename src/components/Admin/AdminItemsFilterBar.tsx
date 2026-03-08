import filterIcon from '../../assets/admin/filter.svg';
import searchIcon from '../../assets/admin/glass.svg';

interface AdminItemsFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
}

export default function AdminItemsFilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchPlaceholder = '물품 검색',
}: AdminItemsFilterBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-4 md:mb-6 w-full">
      {/* 카테고리 버튼들 */}
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
        <button className="bg-white border border-black rounded-[36px] h-[34px] md:h-[41px] px-[12px] md:px-[18px] flex items-center gap-2 hover:bg-gray-50 transition-colors flex-shrink-0">
          <img src={filterIcon} alt="필터" className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="font-['Gmarket_Sans'] font-medium text-[12px] md:text-[15px]">필터</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`h-[34px] md:h-[41px] px-[12px] md:px-[18px] rounded-[36px] font-['Gmarket_Sans'] font-medium text-[12px] md:text-[15px] transition-colors flex items-center justify-center flex-shrink-0 ${
              category === selectedCategory
                ? 'bg-[#fe6949] text-white'
                : 'bg-white border border-black text-black hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* 검색창 */}
      <div className="w-full sm:ml-auto sm:w-[217px] flex items-center gap-2 bg-white border border-[#C3C3C3] rounded-[10px] h-[40px] md:h-[53px] px-4">
        <img src={searchIcon} alt="검색" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none font-['HanbatGothic'] font-medium text-[14px] md:text-[16px] placeholder:text-[#8E8E8E] min-w-0"
        />
      </div>
    </div>
  );
}
