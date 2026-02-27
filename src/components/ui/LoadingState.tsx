interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "로딩 중...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`flex justify-center items-center py-20 ${className}`}>
      <p className="text-[20px] text-[#606060]">{message}</p>
    </div>
  );
}
