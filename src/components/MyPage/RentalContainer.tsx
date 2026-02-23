import RentalStatusBadge from './RentalStatusBadge';
import calendarIcon from '../../assets/mypage/calendar.svg';

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
  itemCount,
  startDate,
  endDate,
  totalCount,
  onEdit,
  onCancel,
  className = '',
}: RentalContainerProps) => {
  return (
    <div
      className={`relative bg-white border border-[#b9b9b9] rounded-[21px] w-[1091px] h-[149px] ${className}`}
    >
      {/* 상태 배지 및 예약 정보 */}
      <div className="absolute left-[24px] top-[14px] flex items-center gap-[16px]">
        <RentalStatusBadge status={status} />
        <div className="flex flex-col gap-[1px]">
          <p className="text-[13px] font-light text-[#919191]">
            {reservationNumber}
          </p>
          <p className="text-[13px] font-light text-[#919191]">
            신청일 {applicationDate}
          </p>
        </div>
      </div>

      {/* 제목 */}
      <div className="absolute left-[24px] top-[62px]">
        <h3
          className="text-[24px] font-semibold text-[#410f07]"
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
            letterSpacing: '-0.64px',
          }}
        >
          {title} 외 {itemCount}건
        </h3>
      </div>

      {/* 캘린더 아이콘과 날짜 정보 */}
      <div className="absolute left-[24px] top-[110px] flex items-center gap-[13px]">
        <img src={calendarIcon} alt="calendar" width="16" height="16" />
        <p className="text-[15px] font-medium text-[#5b5b5b]">
          {startDate} ~ {endDate}   |   총 {totalCount}개
        </p>
      </div>

      {/* 버튼 그룹 */}
      <div className="absolute right-[37px] top-[88px] flex items-center gap-[10px]">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-[60px] h-[40px] bg-white border-[0.5px] border-[#a4a4a4] rounded-[13px] text-[16px] font-medium text-black hover:bg-gray-50"
          >
            수정
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-[120px] h-[40px] bg-[#ffd2d2] border-[0.5px] border-[#ff5151] rounded-[13px] text-[16px] font-medium text-[red] hover:bg-[#ffc0c0]"
          >
            예약 취소
          </button>
        )}
      </div>
    </div>
  );
};

export default RentalContainer;
