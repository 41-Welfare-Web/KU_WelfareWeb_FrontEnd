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
    <div className="flex items-center gap-4 mb-6 w-full">
      {/* 필터 버튼 */}
      <button className="bg-white border border-black rounded-[36px] h-[41px] px-[18px] flex items-center gap-2 hover:bg-gray-50 transition-colors">
        <img src={filterIcon} alt="필터" className="w-4 h-4" />
        <span className="font-['Gmarket_Sans'] font-medium text-[15px]">필터</span>
      </button>
      
      {/* 카테고리 버튼들 */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`h-[41px] px-[18px] rounded-[36px] font-['Gmarket_Sans'] font-medium text-[15px] transition-colors ${
            category === selectedCategory
              ? 'bg-[#fe6949] text-white'
              : 'bg-white border border-black text-black hover:bg-gray-50'
          }`}
        >
          {category}
        </button>
      ))}
      
      {/* 검색창 */}
      <div className="ml-auto flex items-center gap-2 bg-white border border-[#C3C3C3] rounded-[10px] h-[53px] px-4 w-[217px]">
        <img src={searchIcon} alt="검색" className="w-5 h-5" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none font-['HanbatGothic'] font-medium text-[16px] placeholder:text-[#8E8E8E]"
        />
      </div>
    </div>
  );
}
