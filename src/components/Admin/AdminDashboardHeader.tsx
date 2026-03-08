import downloadIcon from '../../assets/admin/download.svg';

type TabType = 'rental' | 'plotter' | 'items';

interface AdminDashboardHeaderProps {
  activeTab: TabType;
  onDownload: () => void;
  onAddItem?: () => void;
  className?: string;
}

export default function AdminDashboardHeader({
  activeTab,
  onDownload,
  onAddItem,
  className = '',
}: AdminDashboardHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 md:mb-6 ${className}`}>
      <div className="relative inline-block">
        <h1 className="text-[28px] md:text-[48px] font-bold text-[#410f07] mb-2">관리자 대시보드</h1>
        <div className="absolute left-0 bottom-0 w-full h-[3px] md:h-[4px] bg-[#410f07]"></div>
      </div>
      
      {/* 버튼 그룹 */}
      <div className="flex gap-2 md:gap-3 flex-shrink-0">
        {/* 신규 물품 등록 버튼 */}
        {activeTab === 'items' && onAddItem && (
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 bg-[#f72] border border-white rounded-[13px] h-[36px] md:h-[40px] px-3 md:px-4 hover:opacity-90 transition-opacity"
          >
            <span className="font-['Gmarket_Sans'] font-medium text-[14px] md:text-[20px] text-white">신규 물품 등록</span>
          </button>
        )}
        
        {/* 엑셀 다운로드 버튼 */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 bg-white border border-[#a4a4a4] rounded-[13px] h-[36px] md:h-[40px] px-3 md:px-4 hover:bg-gray-50 transition-colors"
        >
          <img src={downloadIcon} alt="다운로드" className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-['Gmarket_Sans'] font-medium text-[14px] md:text-[20px]">엑셀 다운로드</span>
        </button>
      </div>
    </div>
  );
}
