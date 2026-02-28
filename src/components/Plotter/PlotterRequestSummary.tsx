interface PlotterRequestSummaryProps {
  purpose: string;
  quantity: number;
  expectedDate: string;
  applicantName: string;
  studentNo: string;
  phone: string;
  className?: string;
}

export default function PlotterRequestSummary({
  purpose,
  quantity,
  expectedDate,
  applicantName,
  studentNo,
  phone,
  className = "",
}: PlotterRequestSummaryProps) {
  return (
    <div className={`relative w-full max-w-[782px] h-[180px] md:h-[265px] ${className}`}>
      {/* 상단 박스 */}
      <div className="absolute bg-white h-[90px] md:h-[135px] left-0 rounded-tl-[17px] rounded-tr-[17px] top-0 w-full" />
      
      {/* 하단 박스 */}
      <div className="absolute bg-white h-[90px] md:h-[135px] left-0 rounded-bl-[17px] rounded-br-[17px] top-[88px] md:top-[130px] w-full" />
      
      {/* 구분선 */}
      <div className="absolute left-[20px] md:left-[39px] top-[90px] md:top-[133px] right-[20px] md:right-[49px] h-[1px] bg-[#e5e5e5]" />
      
      {/* 상단 섹션 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[30px] md:top-[44.5px] transform -translate-y-1/2">
        <p className="text-[16px] md:text-[25px] font-medium text-black whitespace-nowrap">{purpose}</p>
      </div>
      
      {/* 상단 섹션 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[30px] md:top-[44.5px] transform -translate-y-1/2">
        <p className="text-[16px] md:text-[25px] font-bold text-black whitespace-nowrap">{quantity}부</p>
      </div>
      
      {/* 수령 가능일 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[65px] md:top-[95.5px] transform -translate-y-1/2">
        <p className="text-[16px] md:text-[25px] font-medium text-black whitespace-nowrap">수령 가능일</p>
      </div>
      
      {/* 수령 가능일 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[65px] md:top-[95.5px] transform -translate-y-1/2">
        <p className="text-[16px] md:text-[25px] font-bold text-black whitespace-nowrap">{expectedDate}</p>
      </div>
      
      {/* 신청자 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[120px] md:top-[177.5px] transform -translate-y-1/2">
        <p className="text-[14px] md:text-[25px] font-normal text-[#676767] whitespace-nowrap">신청자</p>
      </div>
      
      {/* 신청자 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[120px] md:top-[177.5px] transform -translate-y-1/2">
        <p className="text-[14px] md:text-[25px] font-bold text-black whitespace-nowrap">
          {applicantName} ({studentNo})
        </p>
      </div>
      
      {/* 연락처 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[154px] md:top-[227.5px] transform -translate-y-1/2">
        <p className="text-[14px] md:text-[25px] font-normal text-[#676767] whitespace-nowrap">연락처</p>
      </div>
      
      {/* 연락처 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[154px] md:top-[227.5px] transform -translate-y-1/2">
        <p className="text-[14px] md:text-[25px] font-bold text-black whitespace-nowrap">{phone}</p>
      </div>
    </div>
  );
}
