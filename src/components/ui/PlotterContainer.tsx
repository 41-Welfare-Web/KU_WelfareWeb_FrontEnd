import StatusBadge from './StatusBadge';

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

      {/* 캘린더 아이콘 + 날짜 정보 */}
      <div className="absolute left-[24px] top-[105px] flex items-center gap-[5px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19 4H18V3C18 2.73478 17.8946 2.48043 17.7071 2.29289C17.5196 2.10536 17.2652 2 17 2C16.7348 2 16.4804 2.10536 16.2929 2.29289C16.1054 2.48043 16 2.73478 16 3V4H8V3C8 2.73478 7.89464 2.48043 7.70711 2.29289C7.51957 2.10536 7.26522 2 7 2C6.73478 2 6.48043 2.10536 6.29289 2.29289C6.10536 2.48043 6 2.73478 6 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H6V7C6 7.26522 6.10536 7.51957 6.29289 7.70711C6.48043 7.89464 6.73478 8 7 8C7.26522 8 7.51957 7.89464 7.70711 7.70711C7.89464 7.51957 8 7.26522 8 7V6H16V7C16 7.26522 16.1054 7.51957 16.2929 7.70711C16.4804 7.89464 16.7348 8 17 8C17.2652 8 17.5196 7.89464 17.7071 7.70711C17.8946 7.51957 18 7.26522 18 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z"
            fill="currentColor"
          />
        </svg>
        <p className="text-[15px] font-medium text-[#5b5b5b]">
          {printDate}
        </p>
      </div>
    </div>
  );
};

export default PlotterContainer;
