interface TabSelectorProps {
  activeTab: 'rental' | 'plotter' | 'profile';
  onTabChange: (tab: 'rental' | 'plotter' | 'profile') => void;
  className?: string;
}

const TabSelector = ({ activeTab, onTabChange, className = '' }: TabSelectorProps) => {
  const tabs = [
    { id: 'rental' as const, label: '물품 대여 예약 내역' },
    { id: 'plotter' as const, label: '플로터 예약 내역' },
    { id: 'profile' as const, label: '개인정보 수정' },
  ];

  return (
    <div className={`flex h-[94px] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-[293px] h-full text-[30px] font-medium text-[#410f07] transition-colors rounded-tl-[10px] rounded-tr-[10px] ${
            activeTab === tab.id
              ? 'bg-[#ff7755]'
              : 'bg-white hover:bg-[#f5f5f5] border border-[#e3e3e3]'
          }`}
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
            letterSpacing: '-0.6px',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
