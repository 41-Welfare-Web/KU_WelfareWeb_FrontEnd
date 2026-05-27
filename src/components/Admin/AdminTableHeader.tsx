interface Column {
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
  icon?: string;
  sortKey?: string;
}

interface AdminTableHeaderProps {
  columns: Column[];
  className?: string;
  onColumnSort?: (sortKey: string) => void;
}

export default function AdminTableHeader({
  columns,
  className = '',
  onColumnSort,
}: AdminTableHeaderProps) {
  return (
    <div className={`hidden md:flex bg-[#EDEDED] border-b border-[#C2C2C2] h-[52px] items-center px-4 gap-2 font-['HanbatGothic'] font-medium text-[16px] text-black ${className}`}>
      {columns.map((column, index) => (
        <div
          key={index}
          className={`${column.width} flex items-center justify-center ${column.sortKey ? 'cursor-pointer hover:opacity-80' : ''}`}
          style={{ textAlign: column.align || 'center' }}
          onClick={() => column.sortKey && onColumnSort?.(column.sortKey)}
        >
          <span>{column.label}</span>
          {column.icon && <img src={column.icon} alt="sort" className="w-4 h-4 ml-1 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}
