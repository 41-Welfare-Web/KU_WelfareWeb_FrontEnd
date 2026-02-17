interface NoticeBoxProps {
  title?: string;
  items: string[];
  className?: string;
}

export default function NoticeBox({ 
  title = "유의사항", 
  items,
  className = "" 
}: NoticeBoxProps) {
  return (
    <div className={`bg-[#ffe57d] rounded-[30px] p-8 ${className}`}>
      <h3 className="text-[20px] font-medium text-black mb-4">{title}</h3>
      <div className="text-[15px] text-[#606060] space-y-1">
        {items.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
    </div>
  );
}
