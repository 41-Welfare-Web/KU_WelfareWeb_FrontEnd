import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type TabType = "rental" | "plotter";
type RentalStatus = "민증" | "대여 중" | "반납 완료" | "예약 대기";
type PlotterStatus = "대기" | "진행 중" | "완료" | "취소";

type RentalRecord = {
  id: string;
  applicationNo: string;
  applicant: string;
  department: string;
  item: string;
  rentalDate: string;
  returnDate: string;
  status: RentalStatus;
};

type PlotterRecord = {
  id: string;
  applicationNo: string;
  applicant: string;
  department: string;
  fileName: string;
  paperSize: string;
  quantity: number;
  date: string;
  status: PlotterStatus;
};

const MOCK_RENTAL_RECORDS: RentalRecord[] = [
  {
    id: "1",
    applicationNo: "2026-R1",
    applicant: "김도은",
    department: "학생복지위원회",
    item: "행사용 천막",
    rentalDate: "2026-02-10",
    returnDate: "2026-02-12",
    status: "민증",
  },
  {
    id: "2",
    applicationNo: "2026-R2",
    applicant: "정근녕",
    department: "총학생회",
    item: "무선 마이크",
    rentalDate: "2026-02-10",
    returnDate: "2026-02-12",
    status: "대여 중",
  },
  {
    id: "3",
    applicationNo: "2026-R3",
    applicant: "전건호",
    department: "너드더락",
    item: "사각 앰프",
    rentalDate: "2026-02-01",
    returnDate: "2026-02-07",
    status: "반납 완료",
  },
  {
    id: "4",
    applicationNo: "2026-R4",
    applicant: "조세현",
    department: "연구실",
    item: "유선 마이크",
    rentalDate: "2026-02-10",
    returnDate: "2026-02-12",
    status: "대여 중",
  },
  {
    id: "5",
    applicationNo: "2026-R5",
    applicant: "이건희",
    department: "유학생",
    item: "유선 마이크",
    rentalDate: "2026-02-10",
    returnDate: "2026-02-12",
    status: "예약 대기",
  },
];

const MOCK_PLOTTER_RECORDS: PlotterRecord[] = [
  {
    id: "1",
    applicationNo: "2026-P1",
    applicant: "김도은",
    department: "학생복지위원회",
    fileName: "졸업전시_포스터",
    paperSize: "A0",
    quantity: 1,
    date: "2026-02-10",
    status: "대기",
  },
  {
    id: "2",
    applicationNo: "2026-P2",
    applicant: "정근녕",
    department: "학생복지위원회",
    fileName: "대자보",
    paperSize: "A0",
    quantity: 1,
    date: "2026-02-12",
    status: "진행 중",
  },
  {
    id: "3",
    applicationNo: "2026-P3",
    applicant: "김도은",
    department: "학생복지위원회",
    fileName: "길안내 포스터",
    paperSize: "A3",
    quantity: 6,
    date: "2026-02-08",
    status: "완료",
  },
  {
    id: "4",
    applicationNo: "2026-P4",
    applicant: "전건호",
    department: "너드더락",
    fileName: "공연 포스터",
    paperSize: "A3",
    quantity: 5,
    date: "2026-02-10",
    status: "대기",
  },
  {
    id: "5",
    applicationNo: "2026-P5",
    applicant: "이건희",
    department: "일본어 동아리",
    fileName: "모집 포스터",
    paperSize: "A2",
    quantity: 5,
    date: "2026-02-15",
    status: "대기",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("rental");
  const [filterStatus, setFilterStatus] = useState("전체 상태");
  const [searchQuery, setSearchQuery] = useState("");
  const [records] = useState<RentalRecord[]>(MOCK_RENTAL_RECORDS);
  const [plotterRecords] = useState<PlotterRecord[]>(MOCK_PLOTTER_RECORDS);

  const handleExcelDownload = () => {
    console.log("엑셀 다운로드");
    alert("엑셀 파일을 다운로드합니다.");
    // TODO: 실제 엑셀 다운로드 구현
  };

  const handleEdit = (id: string) => {
    console.log("수정:", id);
    // TODO: 수정 모달 또는 페이지 이동
  };

  const handleSearch = () => {
    console.log("검색:", searchQuery);
    // TODO: 검색 기능 구현
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.applicant.includes(searchQuery) ||
      record.department.includes(searchQuery) ||
      record.item.includes(searchQuery);
    
    const matchesStatus =
      filterStatus === "전체 상태" || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredPlotterRecords = plotterRecords.filter((record) => {
    const matchesSearch =
      record.applicant.includes(searchQuery) ||
      record.department.includes(searchQuery) ||
      record.fileName.includes(searchQuery);
    
    const matchesStatus =
      filterStatus === "전체 상태" || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header />

      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 pt-8">
          {/* 페이지 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[32px] font-bold text-[#410f07]">관리자 대시보드</h1>
            <button
              onClick={handleExcelDownload}
              className="flex items-center gap-2 bg-white border border-[#a4a4a4] rounded-[13px] px-6 py-2 text-[20px] hover:bg-gray-50 transition"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
              엑셀 다운로드
            </button>
          </div>

          {/* 메인 컨텐츠 카드 */}
          <div className="bg-white rounded-[30px] shadow-lg overflow-hidden">
            {/* 탭 헤더 */}
            <div className="border-b border-[#c3c3c3] px-11 pt-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("rental")}
                  className={`pb-4 text-[30px] font-medium transition relative ${
                    activeTab === "rental" ? "text-[#fe6949]" : "text-[#410f07]"
                  }`}
                >
                  물품 대여 관리
                  {activeTab === "rental" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#fe6949]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("plotter")}
                  className={`pb-4 text-[30px] font-medium transition relative ${
                    activeTab === "plotter" ? "text-[#fe6949]" : "text-[#410f07]"
                  }`}
                >
                  플로터 인쇄 관리
                  {activeTab === "plotter" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#fe6949]" />
                  )}
                </button>
              </div>
            </div>

            {/* 필터 및 검색 */}
            <div className="px-11 py-6">
              <div className="flex items-center gap-4 mb-8">
                {/* 필터 */}
                <div className="flex items-center gap-2">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11,11L16.76,3.62A1,1 0 0,0 16.59,2.22A1,1 0 0,0 16,2H2A1,1 0 0,0 1.38,2.22A1,1 0 0,0 1.21,3.62L7,11V16.87A1,1 0 0,0 7.29,17.7L9.29,19.7A1,1 0 0,0 10.7,19.7A1,1 0 0,0 11,18.87V11M13,16L18,21L23,16Z" />
                  </svg>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-[#a6a6a6] rounded-[10px] px-3 py-1 text-[15px] bg-white"
                  >
                    <option value="전체 상태">전체 상태</option>
                    <option value="민증">민증</option>
                    <option value="대여 중">대여 중</option>
                    <option value="반납 완료">반납 완료</option>
                    <option value="예약 대기">예약 대기</option>
                  </select>
                </div>

                {/* 검색바 */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8e8e8e"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="이름, 학과, 물품 검색"
                      className="w-full h-[40px] bg-[#d9d9d9] rounded-[10px] pl-12 pr-4 text-[20px] placeholder:text-[#8e8e8e]"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="h-[40px] px-6 bg-black text-white rounded-[10px] text-[20px] hover:bg-gray-800 transition"
                  >
                    검색
                  </button>
                </div>
              </div>

              {/* 테이블 */}
              {activeTab === "rental" && (
                <div className="border border-[#d9d9d9] rounded-[10px] overflow-hidden">
                  {/* 테이블 헤더 */}
                  <div className="bg-[#ededed] border-b border-[#c2c2c2] px-8 py-6 grid grid-cols-[1fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_0.8fr] gap-4 text-[20px] font-medium">
                    <div>신청번호</div>
                    <div>신청자</div>
                    <div>소속</div>
                    <div>대여 품목</div>
                    <div>대여 날짜</div>
                    <div>반납 날짜</div>
                    <div>상태</div>
                    <div>비고</div>
                  </div>

                  {/* 테이블 바디 */}
                  <div className="bg-white">
                    {filteredRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className={`px-8 py-4 grid grid-cols-[1fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_0.8fr] gap-4 items-center ${
                          index !== filteredRecords.length - 1 ? "border-b border-[#d9d9d9]" : ""
                        }`}
                      >
                        <div className="text-[20px]">{record.applicationNo}</div>
                        <div className="text-[20px]">{record.applicant}</div>
                        <div className="text-[20px]">{record.department}</div>
                        <div className="text-[20px]">{record.item}</div>
                        <div className="text-[15px]">{record.rentalDate}</div>
                        <div className="text-[15px]">{record.returnDate}</div>
                        <div className="text-[20px]">{record.status}</div>
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleEdit(record.id)}
                            className="hover:bg-gray-100 p-1 rounded transition"
                            title="수정"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "plotter" && (
                <div className="border border-[#d9d9d9] rounded-[10px] overflow-hidden">
                  {/* 테이블 헤더 */}
                  <div className="bg-[#ededed] border-b border-[#c2c2c2] px-8 py-6 grid grid-cols-[1fr_1fr_1.5fr_2fr_1.5fr_1fr_1fr_0.8fr] gap-4 text-[20px] font-medium">
                    <div>신청번호</div>
                    <div>신청자</div>
                    <div>소속</div>
                    <div>파일명</div>
                    <div>옵션</div>
                    <div>날짜</div>
                    <div>상태</div>
                    <div>관리</div>
                  </div>

                  {/* 테이블 바디 */}
                  <div className="bg-white">
                    {filteredPlotterRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className={`px-8 py-4 grid grid-cols-[1fr_1fr_1.5fr_2fr_1.5fr_1fr_1fr_0.8fr] gap-4 items-center ${
                          index !== filteredPlotterRecords.length - 1 ? "border-b border-[#d9d9d9]" : ""
                        }`}
                      >
                        <div className="text-[20px]">{record.applicationNo}</div>
                        <div className="text-[20px]">{record.applicant}</div>
                        <div className="text-[20px]">{record.department}</div>
                        <div className="text-[20px]">{record.fileName}</div>
                        <div className="text-[20px]">{record.paperSize}/{record.quantity}장</div>
                        <div className="text-[15px]">{record.date}</div>
                        <div className="text-[20px]">{record.status}</div>
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleEdit(record.id)}
                            className="hover:bg-gray-100 p-1 rounded transition"
                            title="수정"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
