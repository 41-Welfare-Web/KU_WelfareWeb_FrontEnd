import StatusBadge from '../ui/StatusBadge';
import calendarIcon from '../../assets/mypage/calendar.svg';

interface PlotterContainerProps {
  status: 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';
  reservationNumber: string;
  applicationDate: string;
  title: string;
  printDate: string;
  className?: string;
}

const PlotterContainer = ({
  status,
  reservationNumber,
  applicationDate,
  title,
  printDate,
  className = '',
}: PlotterContainerProps) => {
  return (
    <div
      className={`relative bg-white border border-[#b9b9b9] rounded-[21px] w-[1091px] h-[149px] ${className}`}
    >
      {/* 상태 배지 및 예약 정보 */}
      <div className="absolute left-[24px] top-[14px] flex items-center gap-[16px]">
        <StatusBadge status={status} />
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
          {title}
        </h3>
      </div>

      {/* 캘린더 아이콘과 날짜 정보 */}
      <div className="absolute left-[24px] top-[110px] flex items-center gap-[13px]">
        <img src={calendarIcon} alt="calendar" width="16" height="16" />
        <p className="text-[15px] font-medium text-[#5b5b5b]">
          {printDate}
        </p>
      </div>
    </div>
  );
};

export default PlotterContainer;
