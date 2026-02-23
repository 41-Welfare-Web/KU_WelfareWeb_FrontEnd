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

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center justify-center w-[97px] h-[33px] rounded-[11px] ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <span className="text-[15px] font-medium leading-normal whitespace-nowrap">
        {config.text}
      </span>
    </div>
  );
};

export default RentalStatusBadge;
