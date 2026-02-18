import RentalStatusBadge from './RentalStatusBadge';
import calendarIcon from '../../../assets/mypage/calendar.svg';

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
      {/* 상태 뱃지 */}
      <div className="absolute left-[24px] top-[19px]">
        <RentalStatusBadge status={status} />
      </div>

      {/* 예약 번호 */}
      <p className="absolute left-[137px] top-[19px] text-[13px] font-light text-[#919191]">
        {reservationNumber}
      </p>

      {/* 신청일 */}
      <p className="absolute left-[136px] top-[37px] text-[13px] font-light text-[#919191]">
        신청일 {applicationDate}
      </p>

      {/* 제목 */}
      <div className="absolute left-[24px] top-[61px]">
        <h3
          className="text-[32px] font-semibold text-[#410f07]"
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
            letterSpacing: '-0.64px',
          }}
        >
          {title} 외 {itemCount}건
        </h3>
      </div>

      {/* 캘린더 아이콘 */}
      <div className="absolute left-[24px] top-[105px]">
        <img src={calendarIcon} alt="calendar" width="24" height="24" />
      </div>

      {/* 날짜 정보 */}
      <p className="absolute left-[53px] top-[110px] text-[15px] font-medium text-[#5b5b5b]">
        {startDate} ~ {endDate}   |   총 {totalCount}개
      </p>

      {/* 수정 버튼 */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute left-[807px] top-[50px] w-[93px] h-[49px] bg-white border-[0.5px] border-[#a4a4a4] rounded-[13px] text-[20px] font-medium text-black hover:bg-gray-50"
        >
          수정
        </button>
      )}

      {/* 예약 취소 버튼 */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute left-[910px] top-[50px] w-[134px] h-[49px] bg-[#ffd2d2] border-[0.5px] border-[#ff5151] rounded-[13px] text-[20px] font-medium text-[red] hover:bg-[#ffc0c0]"
        >
          예약 취소
        </button>
      )}
    </div>
  );
};

export default RentalContainer;
