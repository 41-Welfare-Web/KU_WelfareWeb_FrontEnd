import FileOrangeIcon from "../../../assets/plotter/file-orange.svg";

interface PlotterFormFieldsProps {
  studentNo: string;
  name: string;
  unit: string;
  onUnitChange: (value: string) => void;
  phone: string;
  purpose: string;
  onPurposeChange: (value: string) => void;
  paperSize: string;
  onPaperSizeChange: (value: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  className?: string;
}

export default function PlotterFormFields({
  studentNo,
  name,
  unit,
  onUnitChange,
  phone,
  purpose,
  onPurposeChange,
  paperSize,
  onPaperSizeChange,
  quantity,
  onQuantityChange,
  className = "",
}: PlotterFormFieldsProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-8">
        <img src={FileOrangeIcon} alt="File" className="w-9 h-9" />
        <h2 className="text-[32px] font-bold text-[#410f07]">신청 정보 입력</h2>
      </div>

      {/* 학번 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">학번</label>
        <input
          type="text"
          value={studentNo}
          disabled
          className="w-full h-[71px] px-6 rounded-[10px] border border-[#8e8e8e] bg-[#a2a2a2] text-[#666] text-[20px]"
        />
      </div>

      {/* 이름 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">이름</label>
        <input
          type="text"
          value={name}
          disabled
          className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[#666] text-[20px]"
        />
      </div>

      {/* 소속 단위 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">소속 단위</label>
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px] appearance-none cursor-pointer"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right 20px center' 
          }}
        >
          <option>학생복지위원회</option>
          <option>총학생회</option>
          <option>동아리연합회</option>
        </select>
      </div>

      {/* 전화번호 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">전화번호</label>
        <input
          type="tel"
          value={phone}
          disabled
          className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[#666] text-[20px]"
        />
      </div>

      {/* 목적 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">목적</label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => onPurposeChange(e.target.value)}
          className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px]"
        />
      </div>

      {/* 용지 크기 & 인쇄 장수 */}
      <div className="flex gap-4 mb-6">
        <div className="w-[311px]">
          <label className="block text-[20px] font-medium text-black mb-2">용지 크기</label>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value)}
            className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px] appearance-none cursor-pointer"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 20px center' 
            }}
          >
            <option value="">용지를 선택하세요</option>
            <option value="A1(594 x 941mm)">A1(594 x 941mm)</option>
            <option value="A2(420 x 594mm)">A2(420 x 594mm)</option>
            <option value="A3(297 x 420mm)">A3(297 x 420mm)</option>
          </select>
        </div>
        <div className="w-[268px]">
          <label className="block text-[20px] font-medium text-black mb-2">인쇄 장수</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px] quantity-input"
            />
            <span className="text-[35px] font-medium">장</span>
          </div>
        </div>
      </div>
    </div>
  );
}
