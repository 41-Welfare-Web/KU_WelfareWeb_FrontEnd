type PlotterBadgeStatus = "waiting" | "confirmed" | "printing" | "completed" | "rejected";

interface PlotterStatusBadgeProps {
  status: PlotterBadgeStatus;
  className?: string;
}

const statusConfig = {
  waiting: {
    text: "예약 대기",
    bgColor: "bg-[#fdd297]",
    textColor: "text-[#f54a00]",
  },
  confirmed: {
    text: "예약 확정",
    bgColor: "bg-[#97f2fd]",
    textColor: "text-[#155dfc]",
  },
  printing: {
    text: "출력 완료",
    bgColor: "bg-[#a9ffca]",
    textColor: "text-[#1b811f]",
  },
  completed: {
    text: "수령 완료",
    bgColor: "bg-[#ddd]",
    textColor: "text-[#4a5565]",
  },
  rejected: {
    text: "예약 반려",
    bgColor: "bg-[#ffa2a2]",
    textColor: "text-[red]",
  },
};

export default function PlotterStatusBadge({ status, className = "" }: PlotterStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    console.warn(`Unknown plotter status: ${status}`);
    return (
      <div className={`flex items-center justify-center w-[90px] md:w-[97px] max-w-full h-[30px] md:h-[33px] rounded-[11px] bg-gray-200 ${className}`}>
        <p className="text-[13px] md:text-[15px] font-medium text-gray-600 truncate px-2">알 수 없음</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center w-[90px] md:w-[97px] max-w-full h-[30px] md:h-[33px] rounded-[11px] ${config.bgColor} ${className}`}
    >
      <p className={`text-[13px] md:text-[15px] font-medium ${config.textColor} truncate px-2`}>
        {config.text}
      </p>
    </div>
  );
}
