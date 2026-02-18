import StatusBadge from './StatusBadge';
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
      {/* 상태 뱃지 */}
      <div className="absolute left-[24px] top-[19px]">
        <StatusBadge status={status} />
      </div>

      {/* 예약 번호 */}
      <p className="absolute left-[135px] top-[19px] text-[13px] font-light text-[#919191]">
        {reservationNumber}
      </p>

      {/* 신청일 */}
      <p className="absolute left-[134px] top-[37px] text-[13px] font-light text-[#919191]">
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
          {title}
        </h3>
      </div>

      {/* 캘린더 아이콘 */}
      <div className="absolute left-[24px] top-[105px]">
        <img src={calendarIcon} alt="calendar" width="24" height="24" />
      </div>

      {/* 날짜 정보 */}
      <p className="absolute left-[53px] top-[110px] text-[15px] font-medium text-[#5b5b5b]">
        {printDate}
      </p>
    </div>
  );
};

export default PlotterContainer;
