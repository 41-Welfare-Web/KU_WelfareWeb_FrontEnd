import { useState } from "react";
import allowIcon from "../../assets/all/allow.svg";

interface DepartmentSelectModalProps {
  departments: string[][];
  selectedType: string;
  selectedName: string | null;
  onSelect: (type: string, name: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function DepartmentSelectModal({
  departments,
  selectedType,
  selectedName,
  onSelect,
  disabled = false,
  className = "",
}: DepartmentSelectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (type: string, name: string | null) => {
    onSelect(type, name);
    setIsOpen(false);
    setHoveredIndex(null);
  };

  // 표시할 텍스트 설정
  const displayText = selectedName || selectedType || "소속 단위를 선택하세요";

  return (
    <div className={`relative ${className}`}>
      {/* 선택 버튼 */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full h-[71px] rounded-[10px] border border-solid border-[#99a1af] flex items-center justify-between px-[24px] ${
          disabled
            ? "bg-[#efefef] cursor-not-allowed"
            : "bg-white cursor-pointer hover:border-[#FF7755]"
        } transition-colors`}
      >
        <p
          className={`text-[20px] font-medium ${
            disabled ? "text-[#afafaf]" : "text-black"
          }`}
        >
          {displayText}
        </p>

        <img
          src={allowIcon}
          alt="arrow"
          className={`w-[25px] h-[25px] transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* 드롭다운 모달 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 메인 대분류 목록 */}
          <div className="absolute left-0 top-full mt-2 w-full bg-white border border-[#99a1af] rounded-[10px] shadow-xl z-50 max-h-[400px] overflow-x-visible overflow-y-auto">
            {departments.map((deptGroup, index) => {
              const mainCategory = deptGroup[0];
              const subCategories = deptGroup.slice(1);
              const hasSubCategories = subCategories.length > 0;

              return (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* 대분류 항목 */}
                  <button
                    onClick={() => handleSelect(mainCategory, null)}
                    className={`w-full px-6 py-4 text-left text-[18px] hover:bg-[#fff5f2] transition-colors flex items-center justify-between ${
                      selectedType === mainCategory && !selectedName ? "bg-[#ffe8e0] font-semibold" : ""
                    }`}
                  >
                    <span>{mainCategory}</span>
                    {hasSubCategories && (
                      <span className="text-[#666] text-[16px] font-bold">▶</span>
                    )}
                  </button>

                  {/* 하위 분류 목록 (호버 시 표시) */}
                  {hasSubCategories && hoveredIndex === index && (
                    <div 
                      className="absolute left-full top-0 ml-2 w-[300px] bg-white border-2 border-[#FF7755] rounded-[10px] shadow-2xl z-[60] max-h-[400px] overflow-y-auto"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {subCategories.map((subCategory, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleSelect(mainCategory, subCategory)}
                          className={`w-full px-6 py-4 text-left text-[18px] hover:bg-[#fff5f2] transition-colors border-b border-[#f0f0f0] last:border-b-0 ${
                            selectedType === mainCategory && selectedName === subCategory ? "bg-[#ffe8e0] font-semibold" : ""
                          }`}
                        >
                          {subCategory}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
