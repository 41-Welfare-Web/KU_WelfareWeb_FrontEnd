import PlotterStatusBadge from '../Plotter/PlotterStatusBadge';
import calendarIcon from '../../assets/mypage/calendar.svg';

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // ISO 형식이면 날짜 부분만 추출
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};

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
      className={`relative bg-white border border-[#b9b9b9] rounded-[21px] w-full h-[120px] md:h-[149px] ${className}`}
    >
      {/* 상태 배지 및 예약 정보 */}
      <div className="absolute left-[16px] md:left-[24px] top-[10px] md:top-[14px] flex items-center gap-[8px] md:gap-[16px]">
        <PlotterStatusBadge status={status} />
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
          {title || '플로터 주문'}
        </h3>
      </div>

      {/* 캠린더 아이콘과 날짜 정보 */}
      <div className="absolute left-[16px] md:left-[24px] top-[82px] md:top-[110px] flex items-center gap-[8px] md:gap-[13px]">
        <img src={calendarIcon} alt="calendar" width="14" height="14" className="md:w-4 md:h-4" />
        <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
          {printDate ? formatDate(printDate) : '수령일 미정'}
        </p>
      </div>
    </div>
  );
};

export default PlotterContainer;
