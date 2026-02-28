interface EmptyStateProps {
  message: string;
  className?: string;
}

export default function EmptyState({
  message,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex justify-center items-center py-20 ${className}`}>
      <p className="text-[20px] text-[#606060]">{message}</p>
    </div>
  );
}
