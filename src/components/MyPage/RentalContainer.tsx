import RentalStatusBadge from './RentalStatusBadge';
import calendarIcon from '../../assets/mypage/calendar.svg';

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // ISO 형식이면 날짜 부분만 추출
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};

interface RentalContainerProps {
  status: 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled';
  reservationNumber: string;
  applicationDate: string;
  title: string;
  itemCount: number;
  startDate: string;
  endDate: string;
  totalCount?: number;
  items?: Array<{ name: string; quantity: number }>;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
}

const RentalContainer = ({
  status,
  reservationNumber,
  applicationDate,
  title,
  startDate,
  endDate,
  totalCount,
  items,
  onEdit,
  onCancel,
  className = '',
}: RentalContainerProps) => {
  // 수량 문자열 생성 (물품명은 title에 이미 있으므로 수량만 표시)
  const quantityText = items && items.length > 0
    ? `${items[0].quantity}개`
    : totalCount !== undefined ? `${totalCount}개` : '';
  return (
    <div
      className={`bg-white border border-[#b9b9b9] rounded-[21px] w-full p-4 md:p-6 ${className}`}
    >
      {/* 모바일: 세로 레이아웃 / 데스크톱: 가로 레이아웃 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* 왼쪽 영역: 상태 배지, 예약 정보, 제목 */}
        <div className="flex-1 flex flex-col gap-3">
          {/* 상태 배지 및 예약 정보 */}
          <div className="flex items-center gap-3">
            <RentalStatusBadge status={status} />
            <div className="flex flex-col gap-1">
              <p className="text-[11px] md:text-[13px] font-light text-[#919191]">
                {reservationNumber}
              </p>
              <p className="text-[11px] md:text-[13px] font-light text-[#919191]">
                신청일 {formatDate(applicationDate)}
              </p>
            </div>
          </div>

          {/* 제목 */}
          <h3
            className="text-[18px] md:text-[24px] font-semibold text-[#410f07]"
            style={{
              fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
              letterSpacing: '-0.64px',
            }}
          >
            {title || '대여 항목'}
          </h3>

          {/* 캘린더 아이콘과 날짜 정보 */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <img src={calendarIcon} alt="calendar" width="14" height="14" className="md:w-4 md:h-4" />
            <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
              {startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : '날짜 미정'}
            </p>
            {quantityText && (
              <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
                | 수량: {quantityText}
              </p>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 버튼 그룹 */}
        <div className="flex items-center gap-2 md:gap-3 md:flex-shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 md:flex-none w-full md:w-[60px] h-[32px] md:h-[40px] bg-white border-[0.5px] border-[#a4a4a4] rounded-[13px] text-[12px] md:text-[16px] font-medium text-black hover:bg-gray-50 whitespace-nowrap"
            >
              수정
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 md:flex-none w-full md:w-[120px] h-[32px] md:h-[40px] bg-[#ffd2d2] border-[0.5px] border-[#ff5151] rounded-[13px] text-[12px] md:text-[16px] font-medium text-[red] hover:bg-[#ffc0c0] whitespace-nowrap"
            >
              예약 취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalContainer;
