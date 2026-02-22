import { useState } from "react";
import allowIcon from "../../assets/all/allow.svg";

interface SelectModalProps {
  text: string;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function SelectModal({ 
  text, 
  disabled = false, 
  isOpen = false,
  onToggle,
  className = "" 
}: SelectModalProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  
  const handleClick = () => {
    if (disabled) return;
    
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };
  
  const currentOpen = onToggle !== undefined ? isOpen : internalOpen;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative h-[71px] rounded-[10px] border border-solid border-[#99a1af] flex items-center justify-between px-[24px] ${
        disabled 
          ? "bg-[#efefef] cursor-not-allowed" 
          : "bg-white cursor-pointer hover:border-[#FF7755]"
      } transition-colors ${className}`}
    >
      <p 
        className={`font-medium ${
          disabled ? "text-[#afafaf]" : "text-black"
        }`}
        style={{ fontFamily: "'Gmarket Sans', sans-serif" }}
      >
        {text}
      </p>
      
      <div className="flex items-center justify-center">
        <img 
          src={allowIcon} 
          alt="arrow"
          className={`w-[25px] h-[25px] ${
            currentOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
    </button>
  );
}
