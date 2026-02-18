import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import filterIcon from '../../assets/admin/filter.svg';
import searchIcon from '../../assets/admin/glass.svg';
import editIcon from '../../assets/admin/pencil.svg';
import downloadIcon from '../../assets/admin/download.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type TabType = 'rental' | 'plotter';

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
  };
  startDate: string;
  endDate: string;
  status: 'RESERVED' | 'RENTED' | 'RETURNED' | 'OVERDUE' | 'CANCELED';
  itemSummary: string;
  createdAt: string;
}

interface PlotterData {
  id: number;
  user: {
    name: string;
    studentId: string;
  };
  purpose: string;
  paperSize: string;
  pageCount: number;
  pickupDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'PRINTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('rental');
  const [rentalStatusFilter, setRentalStatusFilter] = useState('전체 상태');
  const [plotterStatusFilter, setPlotterStatusFilter] = useState('전체 상태');
  const [rentalSearchQuery, setRentalSearchQuery] = useState('');
  const [plotterSearchQuery, setPlotterSearchQuery] = useState('');
  const [rentalFilterOpen, setRentalFilterOpen] = useState(false);
  const [plotterFilterOpen, setPlotterFilterOpen] = useState(false);
  
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [plotterData, setPlotterData] = useState<PlotterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 대여 목록 조회
  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {
        page: 1,
        pageSize: 100
      };
      
      // 상태 필터 적용
      if (rentalStatusFilter !== '전체 상태') {
        const statusMap: Record<string, string> = {
          '예약': 'RESERVED',
          '대여 중': 'RENTED',
          '정상 반납': 'RETURNED',
          '불량 반납': 'DEFECTIVE',
          '예약 취소': 'CANCELED'
        };
        params.status = statusMap[rentalStatusFilter];
      }

      const response = await axios.get(`${API_BASE_URL}/rentals`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRentalData(response.data.rentals || []);
    } catch (err: any) {
      console.error('대여 목록 조회 실패:', err);
      setError(err.response?.data?.message || '대여 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 플로터 목록 조회
  const fetchPlotterOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {
        page: 1,
        pageSize: 100
      };
      
      // 상태 필터 적용
      if (plotterStatusFilter !== '전체 상태') {
        const statusMap: Record<string, string> = {
          '예약 대기': 'PENDING',
          '예약 확정': 'CONFIRMED',
          '인쇄 완료': 'PRINTED',
          '예약 반려': 'REJECTED',
          '수령 완료': 'COMPLETED'
        };
        params.status = statusMap[plotterStatusFilter];
      }

      const response = await axios.get(`${API_BASE_URL}/plotter/orders`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPlotterData(response.data.orders || []);
    } catch (err: any) {
      console.error('플로터 목록 조회 실패:', err);
      setError(err.response?.data?.message || '플로터 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'rental') {
      fetchRentals();
    } else {
      fetchPlotterOrders();
    }
  }, [activeTab, rentalStatusFilter, plotterStatusFilter]);

  // 대여 상태 변경
  const handleRentalStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_BASE_URL}/rentals/${rentalId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('상태가 변경되었습니다.');
      fetchRentals();
    } catch (err: any) {
      console.error('상태 변경 실패:', err);
      alert(err.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  // 플로터 상태 변경
  const handlePlotterStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_BASE_URL}/plotter/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('상태가 변경되었습니다.');
      fetchPlotterOrders();
    } catch (err: any) {
      console.error('상태 변경 실패:', err);
      alert(err.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  const rentalStatusConfig = {
    RESERVED: { label: '예약', bgColor: 'bg-[#FDD297]', textColor: 'text-[#F54A00]' },
    RENTED: { label: '대여 중', bgColor: 'bg-[#A9FFCA]', textColor: 'text-[#1B811F]' },
    RETURNED: { label: '정상 반납', bgColor: 'bg-[#BEBEBE]', textColor: 'text-[#5B5B5B]' },
    OVERDUE: { label: '연체', bgColor: 'bg-[#FFA2A2]', textColor: 'text-[#FF0000]' },
    CANCELED: { label: '예약 취소', bgColor: 'bg-[#F5FFAA]', textColor: 'text-[#FFDA00]' }
  };

  const plotterStatusConfig = {
    PENDING: { label: '예약 대기', bgColor: 'bg-[#FDD297]', textColor: 'text-[#F54A00]' },
    CONFIRMED: { label: '예약 확정', bgColor: 'bg-[#97F2FD]', textColor: 'text-[#155DFC]' },
    PRINTED: { label: '인쇄 완료', bgColor: 'bg-[#A9FFCA]', textColor: 'text-[#1B811F]' },
    REJECTED: { label: '예약 반려', bgColor: 'bg-[#FFA2A2]', textColor: 'text-[#FF0000]' },
    COMPLETED: { label: '수령 완료', bgColor: 'bg-[#DDDDDD]', textColor: 'text-[#4A5565]' }
  };

  const handleRentalEdit = (rentalId: number) => {
    // TODO: 상태 변경 모달 띄우기
    const newStatus = prompt('변경할 상태를 입력하세요 (RESERVED, RENTED, RETURNED, OVERDUE, CANCELED):');
    if (newStatus) {
      handleRentalStatusChange(rentalId, newStatus.toUpperCase());
    }
  };

  const handlePlotterEdit = (orderId: number) => {
    // TODO: 상태 변경 모달 띄우기
    const newStatus = prompt('변경할 상태를 입력하세요 (PENDING, CONFIRMED, PRINTED, REJECTED, COMPLETED):');
    if (newStatus) {
      handlePlotterStatusChange(orderId, newStatus.toUpperCase());
    }
  };

  const handleRentalSearch = () => {
    // TODO: 검색 기능 구현
    console.log('Search rental:', rentalSearchQuery);
    fetchRentals();
  };

  const handlePlotterSearch = () => {
    // TODO: 검색 기능 구현
    console.log('Search plotter:', plotterSearchQuery);
    fetchPlotterOrders();
  };

  const handleDownload = () => {
    // TODO: CSV 다운로드 구현
    console.log('Download data for tab:', activeTab);
    alert('데이터 다운로드: ' + (activeTab === 'rental' ? '대여 관리' : '플로터 관리'));
  };

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-8 pt-8">
          {/* 상단 영역: 타이틀과 다운로드 버튼 */}
          <div className="flex justify-between items-start mb-6">
            <div className="relative inline-block">
              <h1 className="text-[48px] font-bold text-[#410f07] mb-2">관리자 대시보드</h1>
              <div className="absolute left-0 bottom-0 w-[300px] h-[4px] bg-[#410f07]"></div>
            </div>
            
            {/* 다운로드 버튼 */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white border border-[#C3C3C3] rounded-[10px] h-[40px] px-4 hover:bg-gray-50 transition-colors"
            >
              <img src={downloadIcon} alt="다운로드" className="w-5 h-5" />
              <span className="font-['Gmarket_Sans'] font-medium text-[15px]">다운로드</span>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-8 mb-6 border-b-2 border-[#D9D9D9]">
            <button
              onClick={() => setActiveTab('rental')}
              className={`pb-2 font-['HanbatGothic'] font-medium text-[24px] relative ${
                activeTab === 'rental' ? 'text-[#FE6949]' : 'text-[#8E8E8E]'
              }`}
            >
              물품 대여 관리
              {activeTab === 'rental' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FE6949]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('plotter')}
              className={`pb-2 font-['HanbatGothic'] font-medium text-[24px] relative ${
                activeTab === 'plotter' ? 'text-[#FE6949]' : 'text-[#8E8E8E]'
              }`}
            >
              플로터 인쇄 관리
              {activeTab === 'plotter' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FE6949]"></div>
              )}
            </button>
          </div>

          {/* 대여 관리 탭 내용 */}
          {activeTab === 'rental' && (
            <div>
              {/* 필터 및 검색 바 */}
              <div className="bg-white border border-[#C3C3C3] rounded-[10px] h-[77px] flex items-center px-4 gap-4 mb-6">
                {/* 필터 아이콘 */}
                <img src={filterIcon} alt="필터" className="w-8 h-8" />
                
                {/* 상태 필터 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setRentalFilterOpen(!rentalFilterOpen)}
                    className="bg-white border border-[#A6A6A6] rounded-[10px] h-[31px] px-3 flex items-center gap-2 min-w-[98px]"
                  >
                    <span className="font-['Gmarket_Sans'] font-medium text-[15px]">{rentalStatusFilter}</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  {rentalFilterOpen && (
                    <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                      {['전체 상태', '예약', '대여 중', '정상 반납', '불량 반납', '예약 취소'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setRentalStatusFilter(status);
                            setRentalFilterOpen(false);
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
                    value={rentalSearchQuery}
                    onChange={(e) => setRentalSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-['HanbatGothic'] font-medium text-[20px] text-[#8E8E8E] placeholder:text-[#8E8E8E]"
                  />
                </div>

                {/* 검색 버튼 */}
                <button
                  onClick={handleRentalSearch}
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
                  <div className="w-[150px]">학번</div>
                  <div className="w-[200px]">대여 품목</div>
                  <div className="w-[120px]">대여 날짜</div>
                  <div className="w-[120px]">반납 날짜</div>
                  <div className="w-[100px]">상태</div>
                  <div className="flex-1">관리</div>
                </div>

                {/* 로딩 및 에러 표시 */}
                {loading && (
                  <div className="h-[200px] flex items-center justify-center">
                    <span className="text-gray-500">로딩 중...</span>
                  </div>
                )}
                {error && (
                  <div className="h-[200px] flex items-center justify-center">
                    <span className="text-red-500">{error}</span>
                  </div>
                )}

                {/* 테이블 바디 */}
                {!loading && !error && (
                  <div className="divide-y divide-gray-200">
                    {rentalData.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <span className="text-gray-500">대여 내역이 없습니다.</span>
                      </div>
                    ) : (
                      rentalData.map((rental) => {
                        const status = rentalStatusConfig[rental.status];
                        return (
                          <div key={rental.id} className="h-[53px] flex items-center px-8 hover:bg-gray-50 transition-colors">
                            <div className="w-[120px] font-['HanbatGothic'] font-medium text-[20px]">R-{rental.id}</div>
                            <div className="w-[100px] font-['HanbatGothic'] font-medium text-[20px]">{rental.user.name}</div>
                            <div className="w-[150px] font-['HanbatGothic'] font-medium text-[20px]">{rental.user.studentId}</div>
                            <div className="w-[200px] font-['HanbatGothic'] font-medium text-[20px]">{rental.itemSummary}</div>
                            <div className="w-[120px] font-['HanbatGothic'] font-medium text-[15px]">{rental.startDate}</div>
                            <div className="w-[120px] font-['HanbatGothic'] font-medium text-[15px]">{rental.endDate}</div>
                            <div className="w-[100px]">
                              <div className={`inline-flex h-[26px] px-3 rounded-[5px] items-center justify-center ${status.bgColor}`}>
                                <span className={`font-['Gmarket_Sans'] font-medium text-[15px] ${status.textColor}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <button
                                onClick={() => handleRentalEdit(rental.id)}
                                className="w-6 h-6 hover:opacity-70 transition-opacity"
                                aria-label="상태 변경"
                              >
                                <img src={editIcon} alt="수정" className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 플로터 관리 탭 내용 */}
          {activeTab === 'plotter' && (
            <div>
              {/* 필터 및 검색 바 */}
              <div className="bg-white border border-[#C3C3C3] rounded-[10px] h-[77px] flex items-center px-4 gap-4 mb-6">
                {/* 필터 아이콘 */}
                <img src={filterIcon} alt="필터" className="w-8 h-8" />
                
                {/* 상태 필터 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setPlotterFilterOpen(!plotterFilterOpen)}
                    className="bg-white border border-[#A6A6A6] rounded-[10px] h-[31px] px-3 flex items-center gap-2 min-w-[98px]"
                  >
                    <span className="font-['Gmarket_Sans'] font-medium text-[15px]">{plotterStatusFilter}</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  {plotterFilterOpen && (
                    <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                      {['전체 상태', '예약 대기', '예약 확정', '인쇄 완료', '예약 반려', '수령 완료'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setPlotterStatusFilter(status);
                            setPlotterFilterOpen(false);
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
                    value={plotterSearchQuery}
                    onChange={(e) => setPlotterSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-['HanbatGothic'] font-medium text-[20px] text-[#8E8E8E] placeholder:text-[#8E8E8E]"
                  />
                </div>

                {/* 검색 버튼 */}
                <button
                  onClick={handlePlotterSearch}
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
                  <div className="w-[140px]">학번</div>
                  <div className="w-[160px]">인쇄 목적</div>
                  <div className="w-[100px]">용지 크기</div>
                  <div className="w-[80px]">장수</div>
                  <div className="w-[120px]">수령일</div>
                  <div className="w-[100px]">상태</div>
                  <div className="flex-1 text-center">관리</div>
                </div>

                {/* 로딩 및 에러 표시 */}
                {loading && (
                  <div className="h-[200px] flex items-center justify-center">
                    <span className="text-gray-500">로딩 중...</span>
                  </div>
                )}
                {error && (
                  <div className="h-[200px] flex items-center justify-center">
                    <span className="text-red-500">{error}</span>
                  </div>
                )}

                {/* 테이블 바디 */}
                {!loading && !error && (
                  <div className="divide-y divide-gray-200">
                    {plotterData.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <span className="text-gray-500">플로터 주문 내역이 없습니다.</span>
                      </div>
                    ) : (
                      plotterData.map((plotter) => {
                        const status = plotterStatusConfig[plotter.status];
                        return (
                          <div key={plotter.id} className="h-[53px] flex items-center px-8 hover:bg-gray-50 transition-colors">
                            <div className="w-[120px] font-['HanbatGothic'] font-medium text-[20px]">P-{plotter.id}</div>
                            <div className="w-[100px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.user.name}</div>
                            <div className="w-[140px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.user.studentId}</div>
                            <div className="w-[160px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.purpose}</div>
                            <div className="w-[100px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.paperSize}</div>
                            <div className="w-[80px] font-['HanbatGothic'] font-medium text-[20px]">{plotter.pageCount}장</div>
                            <div className="w-[120px] font-['HanbatGothic'] font-medium text-[15px]">{plotter.pickupDate}</div>
                            <div className="w-[100px]">
                              <div className={`inline-flex h-[26px] px-3 rounded-[5px] items-center justify-center ${status.bgColor}`}>
                                <span className={`font-['Gmarket_Sans'] font-medium text-[15px] ${status.textColor}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 flex justify-center">
                              <button
                                onClick={() => handlePlotterEdit(plotter.id)}
                                className="w-6 h-6 hover:opacity-70 transition-opacity"
                                aria-label="상태 변경"
                              >
                                <img src={editIcon} alt="수정" className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
