interface BtnProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export default function Btn({ text, onClick, className = "" }: BtnProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#FF7755] h-[63px] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#ff8866] transition-colors ${className}`}
    >
      <p className="font-bold text-[24px] text-white">
        {text}
      </p>
    </button>
  );
}
