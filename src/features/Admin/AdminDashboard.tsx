import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AdminRentalRow from '../../components/Admin/AdminRentalRow';
import AdminPlotterRow from '../../components/Admin/AdminPlotterRow';
import AdminFilterBar from '../../components/Admin/AdminFilterBar';
import AdminPlotterFilterBar from '../../components/Admin/AdminPlotterFilterBar';
import AdminItemsFilterBar from '../../components/Admin/AdminItemsFilterBar';
import PlotterRejectHandler from '../../components/Admin/PlotterRejectHandler';
import type { PlotterRejectHandlerRef } from '../../components/Admin/PlotterRejectHandler';
import downloadIcon from '../../assets/admin/download.svg';
import pencilIcon from '../../assets/admin/pencil.svg';
import trashIcon from '../../assets/admin/trash.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type TabType = 'rental' | 'plotter' | 'items';

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
    department?: string;
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
    department?: string;
  };
  purpose: string;
  paperSize: string;
  pageCount: number;
  pickupDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'PRINTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
}

function AdminDashboard() {
  const rejectHandlerRef = useRef<PlotterRejectHandlerRef>(null);
  const [activeTab, setActiveTab] = useState<TabType>('rental');
  const [rentalStatusFilter, setRentalStatusFilter] = useState('전체 보기');
  const [plotterStatusFilter, setPlotterStatusFilter] = useState('전체 상태');
  const [rentalSearchQuery, setRentalSearchQuery] = useState('');
  const [plotterSearchQuery, setPlotterSearchQuery] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [itemsCategoryFilter, setItemsCategoryFilter] = useState('전체');
  const [itemsSearchQuery, setItemsSearchQuery] = useState('');
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [plotterData, setPlotterData] = useState<PlotterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRentals = async (customStartDate?: string, customEndDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      const params: any = {
        page: 1,
        pageSize: 100
      };
      // 상태 필터 적용
      if (rentalStatusFilter !== '전체 보기') {
        const statusMap: Record<string, string> = {
          '예약': 'RESERVED',
          '대여 중': 'RENTED',
          '정상 반납': 'RETURNED',
          '불량 반납': 'DEFECTIVE',
          '예약 취소': 'CANCELED'
        };
        params.status = statusMap[rentalStatusFilter];
      }
      // 날짜 필터 적용
      const start = customStartDate !== undefined ? customStartDate : rentalStartDate;
      const end = customEndDate !== undefined ? customEndDate : rentalEndDate;
      if (start) params.startDate = start;
      if (end) params.endDate = end;

      const response = await axios.get(`${API_BASE_URL}/api/rentals`, {
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

      const response = await axios.get(`${API_BASE_URL}/api/plotter/orders`, {
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

  useEffect(() => {
    if (activeTab === 'rental') {
      fetchRentals();
    } else {
      fetchPlotterOrders();
    }
  }, [activeTab, rentalStatusFilter, plotterStatusFilter]);

  const handleRentalStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_BASE_URL}/api/rentals/${rentalId}/status`,
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

  const handlePlotterStatusChange = async (orderId: number, newStatus: string, rejectReason?: string) => {
    // 반려(REJECTED) 상태로 변경 시 사유가 없거나 공백일 때만 모달 오픈
    if (newStatus === 'REJECTED' && (!rejectReason || !rejectReason.trim())) {
      if (rejectHandlerRef.current) {
        rejectHandlerRef.current.requestReject(orderId, newStatus);
      }
      return;
    }
    // rejectReason이 있으면 무조건 API 호출
    try {
      console.log('[API 호출]', {
        orderId,
        newStatus,
        rejectReason
      });
      const token = localStorage.getItem('accessToken');
      const payload: any = { status: newStatus };
      if (newStatus === 'REJECTED' && rejectReason && rejectReason.trim()) {
        payload.rejectionReason = rejectReason.trim();
      }
      await axios.put(
        `${API_BASE_URL}/api/plotter/orders/${orderId}/status`,
        payload,
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

  const handleRentalSearch = () => {
    fetchRentals(rentalStartDate, rentalEndDate);
  };

  const handlePlotterSearch = () => {
    fetchPlotterOrders();
  };

  const handleDownload = () => {
    const data = activeTab === 'rental' ? rentalData : plotterData;
    if (data.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    let csvContent = '';
    
    if (activeTab === 'rental') {
      // 대여 데이터 CSV 헤더
      csvContent = '예약번호,이름,학번,신청일,예약 기간,상태,물품명\n';
      rentalData.forEach(item => {
        const row = [
          `RENT-${item.id}`,
          item.user.name,
          item.user.studentId,
          item.createdAt.split('T')[0],
          `${item.startDate} ~ ${item.endDate}`,
          item.status,
          item.itemSummary.replace(/,/g, ' ')
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      // 플로터 데이터 CSV 헤더
      csvContent = '주문번호,이름,학번,신청일,목적,용지 크기,장수,수령일,상태\n';
      plotterData.forEach(item => {
        const row = [
          `PLOT-${item.id}`,
          item.user.name,
          item.user.studentId,
          item.createdAt.split('T')[0],
          item.purpose.replace(/,/g, ' '),
          item.paperSize,
          item.pageCount,
          item.pickupDate || '-',
          item.status
        ].join(',');
        csvContent += row + '\n';
      });
    }

    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab === 'rental' ? '대여관리' : '플로터관리'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRentalData = rentalData.filter(item => {
    // 날짜 필터
    let dateMatch = true;
    if (rentalStartDate) {
      const itemStart = item.startDate.slice(0, 10);
      dateMatch = dateMatch && (itemStart >= rentalStartDate);
    }
    if (rentalEndDate) {
      const itemEnd = item.endDate.slice(0, 10);
      dateMatch = dateMatch && (itemEnd <= rentalEndDate);
    }
    // 검색어 필터
    if (!rentalSearchQuery.trim()) return dateMatch;
    const query = rentalSearchQuery.toLowerCase();
    const searchMatch = (
      item.user.name.toLowerCase().includes(query) ||
      item.user.studentId.includes(query) ||
      item.itemSummary.toLowerCase().includes(query) ||
      `RENT-${item.id}`.toLowerCase().includes(query)
    );
    return dateMatch && searchMatch;
  });

  const filteredPlotterData = plotterData.filter(item => {
    if (!plotterSearchQuery.trim()) return true;
    const query = plotterSearchQuery.toLowerCase();
    return (
      item.user.name.toLowerCase().includes(query) ||
      item.user.studentId.includes(query) ||
      item.purpose.toLowerCase().includes(query) ||
      `PLOT-${item.id}`.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-8 pt-8">
          {/* 상단 영역: 타이틀과 버튼들 */}
          <div className="flex justify-between items-start mb-6">
            <div className="relative inline-block">
              <h1 className="text-[48px] font-bold text-[#410f07] mb-2">관리자 대시보드</h1>
              <div className="absolute left-0 bottom-0 w-[300px] h-[4px] bg-[#410f07]"></div>
            </div>
            
            {/* 버튼 그룹 */}
            <div className="flex gap-3">
              {/* 신규 물품 등록 버튼 */}
              {activeTab === 'items' && (
                <button
                  onClick={() => alert('신규 물품 등록 기능 준비 중')}
                  className="flex items-center gap-2 bg-[#f72] border border-white rounded-[13px] h-[40px] px-4 hover:opacity-90 transition-opacity"
                >
                  <span className="font-['Gmarket_Sans'] font-medium text-[20px] text-white">신규 물품 등록</span>
                </button>
              )}
              
              {/* 엑셀 다운로드 버튼 */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white border border-[#a4a4a4] rounded-[13px] h-[40px] px-4 hover:bg-gray-50 transition-colors"
              >
                <img src={downloadIcon} alt="다운로드" className="w-5 h-5" />
                <span className="font-['Gmarket_Sans'] font-medium text-[20px]">엑셀 다운로드</span>
              </button>
            </div>
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
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-2 font-['HanbatGothic'] font-medium text-[24px] relative ${
                activeTab === 'items' ? 'text-[#FE6949]' : 'text-[#8E8E8E]'
              }`}
            >
              물품 목록 관리
              {activeTab === 'items' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FE6949]"></div>
              )}
            </button>
          </div>

          {/* 대여 관리 탭 내용 */}
          {activeTab === 'rental' && (
            <div>
              {/* 필터 바 */}
              <AdminFilterBar
                statusOptions={['전체 보기', '예약', '대여 중', '정상 반납', '불량 반납', '예약 취소']}
                selectedStatus={rentalStatusFilter}
                onStatusChange={setRentalStatusFilter}
                startDate={rentalStartDate}
                endDate={rentalEndDate}
                onStartDateChange={setRentalStartDate}
                onEndDateChange={setRentalEndDate}
                searchQuery={rentalSearchQuery}
                onSearchQueryChange={setRentalSearchQuery}
                onSearch={handleRentalSearch}
                searchPlaceholder="이름, 학과, 물품 검색"
              />

              {/* 테이블 */}
              <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible mt-6">
                {/* 테이블 헤더 */}
                <div className="bg-[#EDEDED] border-b border-[#C2C2C2] h-[52px] flex items-center px-8 gap-4 font-['HanbatGothic'] font-medium text-[16px] text-black">
                  <div className="w-[90px] text-center">신청번호</div>
                  <div className="w-[100px] text-center">신청자</div>
                  <div className="w-[150px] text-center">소속</div>
                  <div className="flex-1 text-center">대여 품목</div>
                  <div className="w-[120px] text-center">대여 날짜</div>
                  <div className="w-[120px] text-center">반납 날짜</div>
                  <div className="w-[100px] text-center">상태</div>
                  <div className="w-[120px] text-center">비고</div>
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
                  <div>
                    {filteredRentalData.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <span className="text-gray-500">{rentalSearchQuery ? '검색 결과가 없습니다.' : '대여 내역이 없습니다.'}</span>
                      </div>
                    ) : (
                      filteredRentalData.map((rental) => {
                        // status 매핑: RENTED -> renting
                        const statusMap: Record<string, "reserved" | "renting" | "returned" | "overdue" | "canceled"> = {
                          'RESERVED': 'reserved',
                          'RENTED': 'renting',
                          'RETURNED': 'returned',
                          'OVERDUE': 'overdue',
                          'CANCELED': 'canceled'
                        };
                        
                        // 역매핑: component status -> API status
                        const reverseStatusMap: Record<"reserved" | "renting" | "returned" | "overdue" | "canceled", string> = {
                          'reserved': 'RESERVED',
                          'renting': 'RENTED',
                          'returned': 'RETURNED',
                          'overdue': 'OVERDUE',
                          'canceled': 'CANCELED'
                        };
                        
                        return (
                          <AdminRentalRow
                            key={rental.id}
                            rentalCode={`R-${rental.id}`}
                            userName={rental.user.name}
                            department={rental.user.department || rental.user.studentId}
                            itemName={rental.itemSummary}
                            startDate={rental.startDate}
                            endDate={rental.endDate}
                            status={statusMap[rental.status] || 'reserved'}
                            onStatusChange={(newStatus) => {
                              handleRentalStatusChange(rental.id, reverseStatusMap[newStatus]);
                            }}
                          />
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
              {/* 필터 바 */}
              <AdminPlotterFilterBar
                statusOptions={['전체 상태', '예약 대기', '예약 확정', '인쇄 완료', '예약 반려', '수령 완료']}
                selectedStatus={plotterStatusFilter}
                onStatusChange={setPlotterStatusFilter}
                searchQuery={plotterSearchQuery}
                onSearchQueryChange={setPlotterSearchQuery}
                onSearch={handlePlotterSearch}
                searchPlaceholder="이름, 학과, 물품 검색"
              />

              {/* 테이블 */}
              <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible mt-6">
                {/* 테이블 헤더 */}
                <div className="bg-[#EDEDED] border-b border-[#C2C2C2] h-[52px] flex items-center px-8 gap-4 font-['HanbatGothic'] font-medium text-[16px] text-black">
                  <div className="w-[90px] text-center">신청번호</div>
                  <div className="w-[100px] text-center">신청자</div>
                  <div className="w-[160px] text-center">소속</div>
                  <div className="flex-1 text-center">파일명</div>
                  <div className="w-[110px] text-center">용지/장수</div>
                  <div className="w-[120px] text-center">날짜</div>
                  <div className="w-[100px] text-center">상태</div>
                  <div className="w-[120px] text-center">비고</div>
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
                  <div>
                    {filteredPlotterData.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <span className="text-gray-500">{plotterSearchQuery ? '검색 결과가 없습니다.' : '플로터 주문 내역이 없습니다.'}</span>
                      </div>
                    ) : (
                      filteredPlotterData.map((plotter) => {
                        // status 매핑: PRINTED -> printing, PENDING -> pending
                        const statusMap: Record<string, 'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed'> = {
                          'PENDING': 'pending',
                          'CONFIRMED': 'confirmed',
                          'PRINTED': 'printed',
                          'REJECTED': 'rejected',
                          'COMPLETED': 'completed'
                        };
                        
                        // 역매핑: component status -> API status
                        const reverseStatusMap: Record<'pending' | 'confirmed' | 'printed' | 'rejected' | 'completed', string> = {
                          'pending': 'PENDING',
                          'confirmed': 'CONFIRMED',
                          'printed': 'PRINTED',
                          'rejected': 'REJECTED',
                          'completed': 'COMPLETED'
                        };
                        
                        return (
                          <AdminPlotterRow
                            key={plotter.id}
                            orderCode={`P-${plotter.id}`}
                            userName={plotter.user.name}
                            club={plotter.user.department || plotter.user.studentId}
                            purpose={plotter.purpose}
                            paperSizeAndCount={`${plotter.paperSize} / ${plotter.pageCount}장`}
                            orderDate={plotter.pickupDate}
                            status={statusMap[plotter.status] || 'pending'}
                            onStatusChange={(newStatus) => {
                              handlePlotterStatusChange(plotter.id, reverseStatusMap[newStatus]);
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 물품 목록 관리 탭 내용 */}
          {activeTab === 'items' && (
            <div>
              {/* 카테고리 필터 바 */}
              <AdminItemsFilterBar
                categories={['전체', '전자기기', '축제용품', '음향기기', '공구', '체육용품']}
                selectedCategory={itemsCategoryFilter}
                onCategoryChange={setItemsCategoryFilter}
                searchQuery={itemsSearchQuery}
                onSearchQueryChange={setItemsSearchQuery}
                onSearch={() => console.log('물품 검색:', itemsSearchQuery)}
                searchPlaceholder="물품 검색"
              />

              {/* 물품 카드 그리드 */}
              <div className="grid grid-cols-4 gap-x-[53px] gap-y-[30px]">
                {/* 예시 물품 카드들 */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="bg-white border border-[#d72002] rounded-[11px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)] overflow-clip relative w-[224px] h-[280px]"
                  >
                    {/* 이미지 영역 */}
                    <div className="w-full h-[193px] bg-gradient-to-br from-blue-400 to-blue-600 relative">
                      <div className="absolute inset-0 bg-[rgba(0,0,0,0.05)]" />
                    </div>

                    {/* 상단 버튼들 */}
                    <div className="absolute top-[7px] right-[7px] flex gap-[9px] z-10">
                      <button className="bg-white border border-black rounded-[5px] w-[23px] h-[23px] flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <img src={pencilIcon} alt="수정" className="w-[19px] h-[19px]" />
                      </button>
                      <button className="bg-white border border-black rounded-[5px] w-[23px] h-[23px] flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <img src={trashIcon} alt="삭제" className="w-[19px] h-[19px]" />
                      </button>
                    </div>

                    {/* 정보 영역 */}
                    <div className="absolute top-[203px] left-[11px] right-[11px]">
                      <p className="font-['Signika'] font-medium text-[13px] text-[#fe6949] leading-normal mb-0">
                        축제용품
                      </p>
                    </div>

                    <div className="absolute top-[203px] right-[11px]">
                      <div className="bg-[#d9d9d9] rounded-[10px] h-[24px] px-2 flex items-center">
                        <span className="font-['Signika'] font-medium text-[11px] text-black tracking-[0.33px]">수량 10개</span>
                      </div>
                    </div>

                    <h3 className="absolute top-[227px] left-[11px] font-['Noto_Sans'] font-semibold text-[20px] text-[#410f07] leading-normal tracking-[-0.4px]">
                      행사용 천막
                    </h3>

                    <p className="absolute top-[249px] left-[11px] right-[11px] font-['Gmarket_Sans'] font-light text-[12px] text-[#410f07] leading-normal">
                      야외 행사 및 축제 부스 운영 시 필요한 접이식 천막입니다.
                    </p>
                  </div>
                ))}
              </div>

              {/* 빈 상태 메시지 (물품이 없을 때) */}
              {false && (
                <div className="h-[400px] flex items-center justify-center">
                  <span className="text-gray-500 text-lg">등록된 물품이 없습니다.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <PlotterRejectHandler
        ref={rejectHandlerRef}
        onSubmit={(orderId, newStatus, reason) => {
          // 반려 사유 입력 후 바로 상태변경 API 호출
          handlePlotterStatusChange(orderId, newStatus, reason);
        }}
      />
    </>
  );
}

export default AdminDashboard;
