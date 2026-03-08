interface RentalStatusBadgeProps {
  status: 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled';
  className?: string;
}

const RentalStatusBadge = ({ status, className = '' }: RentalStatusBadgeProps) => {
  const statusConfig = {
    reserved: {
      text: '예약',
      bgColor: '#fdd297',
      textColor: '#f54a00',
    },
    renting: {
      text: '대여 중',
      bgColor: '#a9ffca',
      textColor: '#1b811f',
    },
    returned: {
      text: '정상 반납',
      bgColor: '#ddd',
      textColor: '#4a5565',
    },
    defective: {
      text: '불량 반납',
      bgColor: '#ffa2a2',
      textColor: 'red',
    },
    canceled: {
      text: '예약 취소',
      bgColor: '#fcff9c',
      textColor: '#ffae00',
    },
  };

  const config = statusConfig[status] || {
    text: '알 수 없음',
    bgColor: '#eee',
    textColor: '#888',
  };

  return (
    <div
      className={`flex items-center justify-center w-[90px] md:w-[97px] max-w-full h-[30px] md:h-[33px] rounded-[11px] ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <span className="text-[13px] md:text-[15px] font-medium leading-normal truncate px-2">
        {config.text}
      </span>
    </div>
  );
};

export default RentalStatusBadge;
