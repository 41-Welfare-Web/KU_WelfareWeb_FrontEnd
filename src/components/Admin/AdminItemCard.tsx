import pencilIcon from '../../assets/admin/pencil.svg';
import trashIcon from '../../assets/admin/trash.svg';

interface AdminItemCardProps {
  id: number;
  name: string;
  category: string;
  description: string;
  quantity: number;
  imageUrl?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export default function AdminItemCard({
  id,
  name,
  category,
  description,
  quantity,
  imageUrl,
  onEdit,
  onDelete,
  className = '',
}: AdminItemCardProps) {
  return (
    <div
      className={`bg-white border border-[#d72002] rounded-[11px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] overflow-clip relative w-[224px] h-[280px] ${className}`}
    >
      {/* 이미지 영역 */}
      <div className="w-full h-[193px] bg-gradient-to-br from-blue-400 to-blue-600 relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.05)]" />
        )}
      </div>

      {/* 상단 버튼들 */}
      <div className="absolute top-[7px] right-[7px] flex gap-[9px] z-10">
        {onEdit && (
          <button
            onClick={() => onEdit(id)}
            className="bg-white border border-black rounded-[5px] w-[23px] h-[23px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="수정"
          >
            <img src={pencilIcon} alt="수정" className="w-[19px] h-[19px]" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="bg-white border border-black rounded-[5px] w-[23px] h-[23px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="삭제"
          >
            <img src={trashIcon} alt="삭제" className="w-[19px] h-[19px]" />
          </button>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="absolute top-[203px] left-[11px] right-[11px]">
        <p className="font-['Signika'] font-medium text-[13px] text-[#fe6949] leading-normal mb-0">
          {category}
        </p>
      </div>

      <div className="absolute top-[203px] right-[11px]">
        <div className="bg-[#d9d9d9] rounded-[10px] h-[24px] px-2 flex items-center">
          <span className="font-['Signika'] font-medium text-[11px] text-black tracking-[0.33px]">
            수량 {quantity}개
          </span>
        </div>
      </div>

      <h3 className="absolute top-[227px] left-[11px] font-['Noto_Sans'] font-semibold text-[20px] text-[#410f07] leading-normal tracking-[-0.4px]">
        {name}
      </h3>

      <p className="absolute top-[249px] left-[11px] right-[11px] font-['Gmarket_Sans'] font-light text-[12px] text-[#410f07] leading-normal line-clamp-2">
        {description}
      </p>
    </div>
  );
}
