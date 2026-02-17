interface InputFieldProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "password" | "number";
  className?: string;
}

export default function InputField({ 
  value, 
  onChange, 
  placeholder,
  disabled = false,
  type = "text",
  className = "" 
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{ fontFamily: "'Gmarket Sans', sans-serif" }}
      className={`h-[71px] rounded-[10px] border border-solid border-[#99a1af] px-[24px] text-[20px] font-medium ${
        disabled 
          ? "bg-[#efefef] text-[#afafaf] cursor-not-allowed" 
          : "bg-white text-black focus:outline-none focus:border-[#FF7755]"
      } ${className}`}
    />
  );
}
