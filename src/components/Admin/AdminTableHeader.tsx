interface Column {
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableHeaderProps {
  columns: Column[];
  className?: string;
}

export default function AdminTableHeader({
  columns,
  className = '',
}: AdminTableHeaderProps) {
  return (
    <div className={`bg-[#EDEDED] border-b border-[#C2C2C2] h-[52px] flex items-center px-8 gap-4 font-['HanbatGothic'] font-medium text-[16px] text-black ${className}`}>
      {columns.map((column, index) => (
        <div
          key={index}
          className={column.width}
          style={{ textAlign: column.align || 'center' }}
        >
          {column.label}
        </div>
      ))}
    </div>
  );
}
