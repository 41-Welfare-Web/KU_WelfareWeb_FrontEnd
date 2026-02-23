import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import filterIcon from '../../assets/admin/filter.svg';
import searchIcon from '../../assets/admin/glass.svg';
import editIcon from '../../assets/admin/pencil.svg';

interface PlotterData {
  id: string;
  code: string;
  userName: string;
  department: string;
  fileName: string;
  options: string;
  date: string;
  status: 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed';
}

export default function AdminPlotterList() {
  const [statusFilter, setStatusFilter] = useState('전체 상태');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // 예시 데이터
  const plotterData: PlotterData[] = [
    {
      id: '1',
      code: '2026-P1',
      userName: '김도은',
      department: '학생복지위원회',
      fileName: '졸업전시_포스터',
      options: 'A0 /1장',
      date: '2026-02-10',
      status: 'pending'
    },
    {
      id: '2',
      code: '2026-P2',
      userName: '정근녕',
      department: '학생복지위원회',
      fileName: '대자보',
      options: 'A0 /1장',
      date: '2026-02-12',
      status: 'confirmed'
    },
    {
      id: '3',
      code: '2026-P3',
      userName: '김도은',
      department: '학생복지위원회',
      fileName: '길안내 포스터',
      options: 'A3 /6장',
      date: '2026-02-08',
      status: 'completed'
    },
    {
      id: '4',
      code: '2026-P4',
      userName: '전건호',
      department: '너드더락',
      fileName: '공연 포스터',
      options: 'A3 /5장',
      date: '2026-02-10',
      status: 'rejected'
    },
    {
      id: '5',
      code: '2026-P5',
      userName: '이건희',
      department: '일본어 동아리',
      fileName: '모집 포스터',
      options: 'A2 /5장',
      date: '2026-02-15',
      status: 'printed'
    }
  ];

  const statusConfig = {
    pending: { label: '예약 대기', bgColor: 'bg-[#FDD297]', textColor: 'text-[#F54A00]' },
    confirmed: { label: '예약 확정', bgColor: 'bg-[#97F2FD]', textColor: 'text-[#155DFC]' },
    printed: { label: '인쇄 완료', bgColor: 'bg-[#A9FFCA]', textColor: 'text-[#1B811F]' },
    rejected: { label: '예약 반려', bgColor: 'bg-[#FFA2A2]', textColor: 'text-[#FF0000]' },
    completed: { label: '수령 완료', bgColor: 'bg-[#DDDDDD]', textColor: 'text-[#4A5565]' }
  };

  const handleEdit = (id: string) => {
    console.log('Edit plotter order:', id);
    alert('플로터 주문 수정: ' + id);
  };

  const handleSearch = () => {
    console.log('Search:', searchQuery);
  };

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-8 pt-8">
          {/* 타이틀 */}
          <div className="mb-6">
            <div className="relative inline-block">
              <h1 className="text-[48px] font-bold text-[#410f07] mb-2">플로터 관리</h1>
              <div className="absolute left-[263px] bottom-0 w-[260px] h-[4px] bg-[#410f07]"></div>
            </div>
            <p className="text-[15px] text-black font-['Gmarket_Sans'] font-medium mt-2">
              예약 대기, 예약 확정, 인쇄 완료, 예약 반려, 수령 완료.
            </p>
          </div>

          {/* 필터 및 검색 바 */}
          <div className="bg-white border border-[#C3C3C3] rounded-[10px] h-[77px] flex items-center px-4 gap-4 mb-6">
            {/* 필터 아이콘 */}
            <img src={filterIcon} alt="필터" className="w-8 h-8" />
            
            {/* 상태 필터 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="bg-white border border-[#A6A6A6] rounded-[10px] h-[31px] px-3 flex items-center gap-2 min-w-[98px]"
              >
                <span className="font-['Gmarket_Sans'] font-medium text-[15px]">{statusFilter}</span>
                <span className="text-gray-400">▼</span>
              </button>
              {filterOpen && (
                <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                  {['전체 상태', '예약 대기', '예약 확정', '인쇄 완료', '예약 반려', '수령 완료'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-[15px]"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 검색창 */}
            <div className="flex-1 bg-[#D9D9D9] rounded-[10px] h-[40px] flex items-center px-3 gap-2">
              <img src={searchIcon} alt="검색" className="w-7 h-7" />
              <input
                type="text"
                placeholder="이름, 학과, 물품 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none font-['HanbatGothic'] font-medium text-[20px] text-[#8E8E8E] placeholder:text-[#8E8E8E]"
              />
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              className="bg-black text-white rounded-[10px] h-[40px] px-6 font-['HanbatGothic'] font-medium text-[20px]"
            >
              검색
            </button>
          </div>

          {/* 테이블 */}
          <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="bg-[#EDEDED] border-b border-[#C2C2C2] h-[77px] flex items-center px-8 font-['HanbatGothic'] font-medium text-[20px] text-black">
              <div className="w-[120px]">신청번호</div>
              <div className="w-[100px]">신청자</div>
              <div className="w-[160px]">소속</div>
              <div className="w-[160px]">파일명</div>
              <div className="w-[110px]">옵션</div>
              <div className="w-[120px]">날짜</div>
              <div className="w-[100px]">상태</div>
              <div className="flex-1 text-center">관리</div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-gray-200">
              {plotterData.map((plotter) => {
                const status = statusConfig[plotter.status];
                return (
                  <div key={plotter.id} className="h-[53px] flex items-center px-8 hover:bg-gray-50 transition-colors">
                    <div className="w-[120px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.code}</div>
                    <div className="w-[100px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.userName}</div>
                    <div className="w-[160px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.department}</div>
                    <div className="w-[160px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.fileName}</div>
                    <div className="w-[110px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.options}</div>
                    <div className="w-[120px] font-['HanbatGothic'] font-medium text-[15px]">{plotter.date}</div>
                    <div className="w-[100px]">
                      <div className={`inline-flex h-[26px] px-3 rounded-[5px] items-center justify-center ${status.bgColor}`}>
                        <span className={`font-['Gmarket_Sans'] font-medium text-[15px] ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <button
                        onClick={() => handleEdit(plotter.id)}
                        className="w-6 h-6 hover:opacity-70 transition-opacity"
                        aria-label="수정"
                      >
                        <img src={editIcon} alt="수정" className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
