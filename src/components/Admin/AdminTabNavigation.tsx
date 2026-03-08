type TabType = 'rental' | 'plotter' | 'items';

interface AdminTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export default function AdminTabNavigation({
  activeTab,
  onTabChange,
  className = '',
}: AdminTabNavigationProps) {
  const tabs = [
    { id: 'rental' as const, label: '물품 대여 관리' },
    { id: 'plotter' as const, label: '플로터 인쇄 관리' },
    { id: 'items' as const, label: '물품 목록 관리' },
  ];

  return (
    <div className={`flex gap-4 md:gap-8 mb-6 md:mb-8 border-b-2 border-[#D9D9D9] overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 font-['HanbatGothic'] font-medium text-[13px] sm:text-[16px] md:text-[24px] relative inline-block whitespace-nowrap flex-shrink-0 ${
            activeTab === tab.id ? 'text-[#FE6949]' : 'text-[#8E8E8E]'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FE6949]"></div>
          )}
        </button>
      ))}
    </div>
  );
}
