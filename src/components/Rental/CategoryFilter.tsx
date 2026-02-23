import type { Category } from "../../api/rental/types";

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onChange: (categoryId: number | null) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onChange,
}: Props) {
  return (
    <div className="min-w-0">
      <div
        className="
          flex items-center gap-3
          overflow-x-auto scrollbar-hide
          whitespace-nowrap
        "
      >
        {/* 전체 */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`h-[44px] px-5 rounded-full text-sm font-medium whitespace-nowrap transition
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
            className={`h-[44px] px-5 rounded-full text-sm font-medium whitespace-nowrap transition
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
  );
}
