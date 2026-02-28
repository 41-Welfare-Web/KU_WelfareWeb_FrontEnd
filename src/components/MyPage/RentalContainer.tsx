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
  totalCount: number;
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
  onEdit,
  onCancel,
  className = '',
}: RentalContainerProps) => {
  return (
    <div
      className={`relative bg-white border border-[#b9b9b9] rounded-[21px] w-full h-[120px] md:h-[149px] ${className}`}
    >
      {/* 상태 배지 및 예약 정보 */}
      <div className="absolute left-[16px] md:left-[24px] top-[10px] md:top-[14px] flex items-center gap-[8px] md:gap-[16px]">
        <RentalStatusBadge status={status} />
        <div className="flex flex-col gap-[1px]">
          <p className="text-[11px] md:text-[13px] font-light text-[#919191]">
            {reservationNumber}
          </p>
          <p className="text-[11px] md:text-[13px] font-light text-[#919191]">
            신청일 {formatDate(applicationDate)}
          </p>
        </div>
      </div>

      {/* 제목 */}
      <div className="absolute left-[16px] md:left-[24px] top-[48px] md:top-[62px]">
        <h3
          className="text-[18px] md:text-[24px] font-semibold text-[#410f07]"
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
            letterSpacing: '-0.64px',
          }}
        >
          {title || '대여 항목'}
        </h3>
      </div>

      {/* 캠린더 아이콘과 날짜 정보 */}
      <div className="absolute left-[16px] md:left-[24px] top-[82px] md:top-[110px] flex items-center gap-[8px] md:gap-[13px]">
        <img src={calendarIcon} alt="calendar" width="14" height="14" className="md:w-4 md:h-4" />
        <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
          {startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : '날짜 미정'}   |   총 {totalCount}개
        </p>
      </div>

      {/* 버튼 그룹 */}
      <div className="absolute right-[12px] md:right-[37px] top-[75px] md:top-[88px] flex items-center gap-[6px] md:gap-[10px]">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-[50px] md:w-[60px] h-[32px] md:h-[40px] bg-white border-[0.5px] border-[#a4a4a4] rounded-[13px] text-[13px] md:text-[16px] font-medium text-black hover:bg-gray-50"
          >
            수정
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-[90px] md:w-[120px] h-[32px] md:h-[40px] bg-[#ffd2d2] border-[0.5px] border-[#ff5151] rounded-[13px] text-[13px] md:text-[16px] font-medium text-[red] hover:bg-[#ffc0c0]"
          >
            예약 취소
          </button>
        )}
      </div>
    </div>
  );
};

export default RentalContainer;
