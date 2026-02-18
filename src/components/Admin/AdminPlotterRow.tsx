import editIcon from '../../assets/admin/pencil.svg';

interface AdminPlotterRowProps {
  orderCode: string;
  userName: string;
  club: string;
  purpose: string;
  paperSizeAndCount: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed';
  onEdit?: () => void;
}

export default function AdminPlotterRow({
  orderCode,
  userName,
  club,
  purpose,
  paperSizeAndCount,
  orderDate,
  status,
  onEdit
}: AdminPlotterRowProps) {
  const statusConfig = {
    pending: {
      label: '예약 대기',
      bgColor: 'bg-[#FFF4CC]',
      textColor: 'text-[#FF9900]'
    },
    confirmed: {
      label: '예약 확정',
      bgColor: 'bg-[#CCF0FF]',
      textColor: 'text-[#0099FF]'
    },
    printed: {
      label: '인쇄 완료',
      bgColor: 'bg-[#D4F4DD]',
      textColor: 'text-[#00B050]'
    },
    rejected: {
      label: '예약 반려',
      bgColor: 'bg-[#FFA2A2]',
      textColor: 'text-[#FF0000]'
    },
    completed: {
      label: '수령 완료',
      bgColor: 'bg-[#E0E0E0]',
      textColor: 'text-[#666666]'
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="relative w-full h-[52px] bg-white border border-gray-200 rounded-lg flex items-center px-7 gap-8">
      {/* 주문 코드, 신청자, 동아리 */}
      <div className="flex items-center gap-4 min-w-[280px]">
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-black tracking-[0.6px]">
          {orderCode}
        </span>
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-black tracking-[0.6px]">
          {userName}
        </span>
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-black tracking-[0.6px]">
          {club}
        </span>
      </div>

      {/* 출력 용도 */}
      <div className="min-w-[140px]">
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-black tracking-[0.6px]">
          {purpose}
        </span>
      </div>

      {/* 용지 규격 및 매수 */}
      <div className="min-w-[100px]">
        <span className="font-['HanbatGothic'] font-medium text-[20px] text-black tracking-[0.6px]">
          {paperSizeAndCount}
        </span>
      </div>

      {/* 신청일 */}
      <div className="min-w-[120px]">
        <span className="font-['HanbatGothic'] font-medium text-[15px] text-black tracking-[0.45px]">
          {orderDate}
        </span>
      </div>

      {/* 상태 배지 */}
      <div className={`h-[26px] px-[9px] rounded-[5px] flex items-center justify-center ${currentStatus.bgColor}`}>
        <span className={`font-['Gmarket_Sans'] font-medium text-[15px] ${currentStatus.textColor}`}>
          {currentStatus.label}
        </span>
      </div>

      {/* 수정 아이콘 버튼 */}
      <button
        onClick={onEdit}
        className="w-6 h-6 ml-auto flex items-center justify-center hover:opacity-70 transition-opacity"
        aria-label="수정"
      >
        <img src={editIcon} alt="수정" className="w-6 h-6" />
      </button>
    </div>
  );
}
