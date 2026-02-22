import { useMemo, useState } from "react";
import filter from "../../assets/rental/filter.svg";

export type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onChange: (categoryId: number | null) => void;
};

export default function Filter({
  categories,
  selectedCategoryId,
  onChange,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (selectedCategoryId === null) return "전체";
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? "전체";
  }, [categories, selectedCategoryId]);

  return (
    <div className="mt-8 md:ml-16">
      {/* PC */}
      <div className="hidden md:flex px-6 md:px-0 items-center gap-3 overflow-x-auto scrollbar-hide text-sm font-medium">
        {/* 필터 버튼 */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black whitespace-nowrap"
        >
          <img src={filter} alt="필터" />
          필터
        </button>

        {/* 전체 */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
            ${
              selectedCategoryId === null
                ? "bg-[#FE6949] text-white"
                : "bg-white text-black hover:bg-gray-300"
            }`}
        >
          전체
        </button>

        {/* 카테고리 */}
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
              ${
                selectedCategoryId === category.id
                  ? "bg-[#FE6949] text-white"
                  : "bg-white text-black hover:bg-gray-300"
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black whitespace-nowrap"
          >
            <img src={filter} alt="필터" />
            필터
            <span className="ml-1">{mobileOpen ? "▲" : "▼"}</span>
          </button>

          {/* 현재 선택 라벨 (UX용) */}
          <div className="px-5 py-2 rounded-full bg-[#FE6949] text-white text-sm font-medium whitespace-nowrap">
            {selectedName}
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-3 p-3 rounded-2xl bg-white/90 shadow-sm">
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setMobileOpen(false);
                }}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition
                  ${
                    selectedCategoryId === null
                      ? "bg-[#FE6949] text-white"
                      : "bg-white text-black hover:bg-gray-300"
                  }`}
              >
                전체
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    onChange(category.id);
                    setMobileOpen(false);
                  }}
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition
                    ${
                      selectedCategoryId === category.id
                        ? "bg-[#FE6949] text-white"
                        : "bg-white text-black hover:bg-gray-300"
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
