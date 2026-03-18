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
  pageCount: number;
  className?: string;
}

const PlotterContainer = ({
  status,
  reservationNumber,
  applicationDate,
  title,
  printDate,
  pageCount,
  className = '',
}: PlotterContainerProps) => {
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
            <PlotterStatusBadge status={status} />
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
            {title || '플로터 주문'}
          </h3>

          {/* 캘린더 아이콘과 날짜 정보 */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <img src={calendarIcon} alt="calendar" width="14" height="14" className="md:w-4 md:h-4" />
            <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
              {printDate ? formatDate(printDate) : '수령일 미정'}
            </p>
            <p className="text-[12px] md:text-[15px] font-medium text-[#5b5b5b]">
              | 장수: {pageCount}장
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotterContainer;
