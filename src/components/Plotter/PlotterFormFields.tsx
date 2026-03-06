import { useState } from "react";
import FileOrangeIcon from "../../assets/plotter/file-orange.svg";
import DepartmentPickerModal from "../DepartmentPickerModal";
import type { PaperSize } from "../../services/commonApi";

interface PlotterFormFieldsProps {
  studentNo: string;
  name: string;
  departmentType: string;
  departmentName: string | null;
  onDepartmentChange: (type: string, name: string | null) => void;
  phone: string;
  purpose: string;
  purposes?: { id: number; name: string }[];
  onPurposeChange: (value: string) => void;
  paperSize: string;
  paperSizes?: PaperSize[];
  onPaperSizeChange: (value: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  className?: string;
}

export default function PlotterFormFields({
  studentNo,
  name,
  departmentType,
  departmentName,
  onDepartmentChange,
  phone,
  purpose,
  purposes = [],
  onPurposeChange,
  paperSize,
  paperSizes = [],
  onPaperSizeChange,
  quantity,
  onQuantityChange,
  className = "",
}: PlotterFormFieldsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
        <img src={FileOrangeIcon} alt="File" className="w-7 h-7 md:w-9 md:h-9" />
        <h2 className="text-[24px] md:text-[32px] font-bold text-[#410f07]">신청 정보 입력</h2>
      </div>

      {/* 학번 */}
      <div className="mb-4 md:mb-6">
        <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">학번</label>
        <input
          type="text"
          value={studentNo}
          disabled
          className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#8e8e8e] bg-[#a2a2a2] text-[#666] text-[16px] md:text-[20px]"
        />
      </div>

      {/* 이름 */}
      <div className="mb-4 md:mb-6">
        <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">이름</label>
        <input
          type="text"
          value={name}
          disabled
          className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[#666] text-[16px] md:text-[20px]"
        />
      </div>

      {/* 소속 단위 */}
      <div className="mb-4 md:mb-6">
        <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">소속 단위</label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[16px] md:text-[16px] text-left appearance-none cursor-pointer font-normal"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right 20px center' 
          }}
        >
          {departmentName ? `${departmentType} - ${departmentName}` : departmentType}
        </button>

        <DepartmentPickerModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          value={{ departmentType, departmentName: departmentName || "" }}
          onConfirm={({ departmentType: type, departmentName: name }) => {
            onDepartmentChange(type, name);
          }}
        />
      </div>

      {/* 전화번호 */}
      <div className="mb-4 md:mb-6">
        <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">전화번호</label>
        <input
          type="tel"
          value={phone}
          disabled
          className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[#666] text-[16px] md:text-[20px]"
        />
      </div>

      {/* 목적 */}
      <div className="mb-4 md:mb-6">
        <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">목적</label>
        <select
          value={purpose}
          onChange={(e) => onPurposeChange(e.target.value)}
          className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[16px] md:text-[20px] appearance-none cursor-pointer"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right 20px center' 
          }}
        >
          {purposes.length > 0 ? (
            purposes.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))
          ) : (
            <option value="" disabled>로딩 중...</option>
          )}
        </select>
      </div>

      {/* 용지 크기 & 인쇄 장수 */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="w-full md:w-[311px]">
          <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">용지 크기</label>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[16px] md:text-[20px] appearance-none cursor-pointer"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 20px center' 
            }}
          >
            <option value="">용지를 선택하세요</option>
            {paperSizes.map((ps) => (
              <option key={ps.id} value={ps.name}>
                {ps.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <label className="block text-[16px] md:text-[20px] font-medium text-black mb-2">인쇄 장수</label>
          <div className="flex items-center gap-3 md:gap-5">
            <input
              type="number"
              value={quantity === 0 ? '' : quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onQuantityChange(0);
                } else {
                  onQuantityChange(parseInt(value) || 0);
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full h-[50px] md:h-[71px] px-4 md:px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[16px] md:text-[20px] quantity-input"
            />
            <span className="text-[24px] md:text-[35px] font-medium">장</span>
          </div>
        </div>
      </div>
    </div>
  );
}
