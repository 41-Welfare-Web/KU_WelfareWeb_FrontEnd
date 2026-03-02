type RentalSummaryItem = {
  name: string;
  range: string; // "YYYY-MM-DD ~ YYYY-MM-DD"
  qty: number;
};

type Props = {
  items: RentalSummaryItem[];
  startDate: string;
  endDate: string;
  applicantName: string; // "홍길동 (2021xxxx)"
  phone: string;
  className?: string;
};

export default function RentalRequestSummary({
  items,
  applicantName,
  phone,
  className = "",
}: Props) {
  return (
    <div
      className={`relative w-full max-w-[782px] h-[180px] md:h-[265px] ${className}`}
    >
      {/* 상단 박스 */}
      <div className="absolute bg-white h-[90px] md:h-[135px] left-0 rounded-tl-[17px] rounded-tr-[17px] top-0 w-full" />

      {/* 하단 박스 */}
      <div className="absolute bg-white h-[90px] md:h-[135px] left-0 rounded-bl-[17px] rounded-br-[17px] top-[88px] md:top-[130px] w-full" />

      {/* 구분선 */}
      <div className="absolute left-[20px] md:left-[39px] top-[90px] md:top-[133px] right-[20px] md:right-[49px] h-[1px] bg-[#e5e5e5]" />

      {/* 상단: 물품/기간/수량 (전부 출력, 상단 영역 스크롤) */}
      <div className="absolute left-[20px] md:left-[39px] right-[20px] md:right-[39px] top-[16px] md:top-[22px]">
        <div className="max-h-[70px] md:max-h-[105px] overflow-y-auto pr-1 space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              {/* 왼쪽: 물품명 */}
              <p className="min-w-0 flex-1 truncate text-[13px] md:text-[18px] font-medium text-black">
                {it.name}
              </p>

              {/* 가운데: 기간 */}
              <p className="flex-[0_0_auto] text-[13px] md:text-[18px] font-bold text-black whitespace-nowrap">
                {it.range}
              </p>

              {/* 오른쪽: 수량 */}
              <p className="flex-[0_0_auto] text-[13px] md:text-[18px] font-bold text-black whitespace-nowrap">
                {it.qty}개
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 신청자 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[120px] md:top-[177.5px] transform -translate-y-1/2">
        <p className="text-[13px] md:text-[20px] font-normal text-[#676767] whitespace-nowrap">
          신청자
        </p>
      </div>

      {/* 신청자 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[120px] md:top-[177.5px] transform -translate-y-1/2">
        <p className="text-[13px] md:text-[20px] font-bold text-black whitespace-nowrap">
          {applicantName}
        </p>
      </div>

      {/* 연락처 - 좌측 */}
      <div className="absolute left-[20px] md:left-[39px] top-[154px] md:top-[227.5px] transform -translate-y-1/2">
        <p className="text-[13px] md:text-[20px] font-normal text-[#676767] whitespace-nowrap">
          연락처
        </p>
      </div>

      {/* 연락처 - 우측 */}
      <div className="absolute right-[20px] md:right-[39px] top-[154px] md:top-[227.5px] transform -translate-y-1/2">
        <p className="text-[13px] md:text-[20px] font-bold text-black whitespace-nowrap">
          {phone}
        </p>
      </div>
    </div>
  );
}
