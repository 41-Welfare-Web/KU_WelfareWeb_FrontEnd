interface ApplicationSummaryProps {
  paperSize?: string;
  quantity?: number;
  expectedDate: string;
  isFree?: boolean;
  totalAmount: number;
  onSubmit: () => void;
  className?: string;
  isSubmitting?: boolean;
}

export default function ApplicationSummary({
  paperSize,
  quantity,
  expectedDate,
  isFree = false,
  totalAmount,
  onSubmit,
  className = "",
  isSubmitting = false,
}: ApplicationSummaryProps) {
  return (
    <div className={`bg-white rounded-[30px] p-8 shadow-lg ${className}`}>
      <h2 className="text-[32px] font-bold text-[#410f07] mb-8">신청 요약</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[20px] text-[#606060]">용지/수량</span>
          <span className="text-[20px] text-[#606060]">
            {paperSize && quantity ? `${paperSize.split('(')[0]}/${quantity}장` : "용지를 선택하세요"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[20px] text-[#606060]">수령 예정일</span>
          <span className="text-[20px] text-[#f72] font-medium">{expectedDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[20px] text-[#606060]">비용 구분</span>
          <span className="inline-block bg-[#d9d9d9] px-4 py-1 rounded-[5px] text-[12px]">
            {isFree ? "무료 결제" : "유료 결제"}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-6 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[20px] text-[#606060]">총 결제금액</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-medium text-[#410f07]">
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-[20px] text-[#606060]">원</span>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`w-full h-[63px] rounded-[10px] shadow-lg text-white text-[24px] font-bold transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#f72] hover:bg-[#e65a3d]"
        }`}
      >
        {isSubmitting ? "신청 중..." : "신청하기"}
      </button>
    </div>
  );
}
