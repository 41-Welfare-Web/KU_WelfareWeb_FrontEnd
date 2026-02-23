import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import filterIcon from '../../assets/admin/filter.svg';
import searchIcon from '../../assets/admin/glass.svg';
import editIcon from '../../assets/admin/pencil.svg';

interface RentalData {
  id: string;
  code: string;
  userName: string;
  department: string;
  itemName: string;
  startDate: string;
  endDate: string;
  status: 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled';
  note?: string;
}

export default function AdminRentalList() {
  const [statusFilter, setStatusFilter] = useState('전체 상태');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // 예시 데이터
  const rentalData: RentalData[] = [
    {
      id: '1',
      code: '2026-R1',
      userName: '김도은',
      department: '학생복지위원회',
      itemName: '행사용 천막',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      status: 'reserved',
      note: 'ㅇㅇ'
    },
    {
      id: '2',
      code: '2026-R2',
      userName: '정근녕',
      department: '총학생회',
      itemName: '무선 마이크',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      status: 'renting'
    },
    {
      id: '3',
      code: '2026-R3',
      userName: '전건호',
      department: '너드더락',
      itemName: '사각 앰프',
      startDate: '2026-02-01',
      endDate: '2026-02-07',
      status: 'returned'
    },
    {
      id: '4',
      code: '2026-R4',
      userName: '조세현',
      department: '연구실',
      itemName: '유선 마이크',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      status: 'defective'
    },
    {
      id: '5',
      code: '2026-R5',
      userName: '이건희',
      department: '유학생',
      itemName: '유선 마이크',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      status: 'canceled'
    }
  ];

  const statusConfig = {
    reserved: { label: '예약', bgColor: 'bg-[#FDD297]', textColor: 'text-[#F54A00]' },
    renting: { label: '대여 중', bgColor: 'bg-[#A9FFCA]', textColor: 'text-[#1B811F]' },
    returned: { label: '정상 반납', bgColor: 'bg-[#BEBEBE]', textColor: 'text-[#5B5B5B]' },
    defective: { label: '불량 반납', bgColor: 'bg-[#FFA2A2]', textColor: 'text-[#FF0000]' },
    canceled: { label: '예약 취소', bgColor: 'bg-[#F5FFAA]', textColor: 'text-[#FFDA00]' }
  };

  const handleEdit = (id: string) => {
    console.log('Edit rental:', id);
    alert('대여 수정: ' + id);
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
              <h1 className="text-[48px] font-bold text-[#410f07] mb-2">대여 관리</h1>
              <div className="absolute left-0 bottom-0 w-[213px] h-[4px] bg-[#410f07]"></div>
            </div>
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
                  {['전체 상태', '예약', '대여 중', '정상 반납', '불량 반납', '예약 취소'].map((status) => (
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
              <div className="w-[150px]">소속</div>
              <div className="w-[150px]">대여 품목</div>
              <div className="w-[150px]">대여 날짜</div>
              <div className="w-[150px]">반납 날짜</div>
              <div className="w-[100px]">상태</div>
              <div className="flex-1">비고</div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-gray-200">
              {rentalData.map((rental) => {
                const status = statusConfig[rental.status];
                return (
                  <div key={rental.id} className="h-[53px] flex items-center px-8 hover:bg-gray-50 transition-colors">
                    <div className="w-[120px] font-['HanbatGothic'] font-medium text-[20px]">{rental.code}</div>
                    <div className="w-[100px] font-['HanbatGothic'] font-medium text-[20px]">{rental.userName}</div>
                    <div className="w-[150px] font-['HanbatGothic'] font-medium text-[20px]">{rental.department}</div>
                    <div className="w-[150px] font-['HanbatGothic'] font-medium text-[20px]">{rental.itemName}</div>
                    <div className="w-[150px] font-['HanbatGothic'] font-medium text-[15px]">{rental.startDate}</div>
                    <div className="w-[150px] font-['HanbatGothic'] font-medium text-[15px]">{rental.endDate}</div>
                    <div className="w-[100px]">
                      <div className={`inline-flex h-[26px] px-3 rounded-[5px] items-center justify-center ${status.bgColor}`}>
                        <span className={`font-['Gmarket_Sans'] font-medium text-[15px] ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-['HanbatGothic'] font-medium text-[20px]">{rental.note || ''}</span>
                      <button
                        onClick={() => handleEdit(rental.id)}
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
