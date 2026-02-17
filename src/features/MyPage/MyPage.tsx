import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProfileEditForm from "../../components/ui/ProfileEditForm";

type ReservationStatus = "예약" | "정상 반납" | "대여 중" | "불량 반납" | "예약 취소";
type PlotterStatus = "예약 대기" | "수령 완료" | "예약 확정" | "인쇄 완료" | "예약 반려" | "예약 취소";
type TabType = "rental" | "plotter" | "profile";

type Reservation = {
  id: string;
  title: string;
  status: ReservationStatus;
  code: string;
  applicationDate: string;
  date: string;
  items?: string;
};

type PlotterReservation = {
  id: string;
  title: string;
  status: PlotterStatus;
  code: string;
  applicationDate: string;
  date: string;
};

const MOCK_RENTAL_RESERVATIONS: Reservation[] = [
  {
    id: "1",
    title: "행사용 현수막 외 0건",
    status: "예약",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-10 ~ 2026-01-14",
    items: "총 1개",
  },
  {
    id: "2",
    title: "행사용 현수막 외 0건",
    status: "정상 반납",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-10 ~ 2026-01-14",
    items: "총 1개",
  },
  {
    id: "3",
    title: "행사용 현수막 외 0건",
    status: "대여 중",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-10 ~ 2026-01-14",
    items: "총 1개",
  },
  {
    id: "4",
    title: "행사용 현수막 외 0건",
    status: "불량 반납",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-10 ~ 2026-01-14",
    items: "총 1개",
  },
];

const MOCK_PLOTTER_RESERVATIONS: PlotterReservation[] = [
  {
    id: "1",
    title: "행사용 현수막 외 0건",
    status: "예약 대기",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-10 ~ 2026-01-14   |   총 1개",
  },
  {
    id: "2",
    title: "대자보 플로터 인쇄",
    status: "수령 완료",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-14",
  },
  {
    id: "3",
    title: "대자보 플로터 인쇄",
    status: "예약 확정",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-14",
  },
  {
    id: "4",
    title: "대자보 플로터 인쇄",
    status: "인쇄 완료",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-14",
  },
  {
    id: "5",
    title: "대자보 플로터 인쇄",
    status: "예약 반려",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-14",
  },
  {
    id: "6",
    title: "대자보 플로터 인쇄",
    status: "예약 취소",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    date: "2026-01-14",
  },
];

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "예약":
      return "bg-[#fdd297] text-[#f54a00]";
    case "정상 반납":
      return "bg-[#bebebe] text-black";
    case "대여 중":
      return "bg-[#96ffbd] text-[#1b811f]";
    case "불량 반납":
      return "bg-[#ffa2a2] text-red-600";
    case "예약 취소":
      return "bg-[#fcff9c] text-[#ffae00]";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

const getPlotterStatusColor = (status: PlotterStatus) => {
  switch (status) {
    case "예약 대기":
      return "bg-[#fdd297] text-[#f54a00]";
    case "수령 완료":
      return "bg-[#ddd] text-[#4a5565]";
    case "예약 확정":
      return "bg-[#97f2fd] text-[#155dfc]";
    case "인쇄 완료":
      return "bg-[#a9ffca] text-[#1b811f]";
    case "예약 반려":
      return "bg-[#ffa2a2] text-red-600";
    case "예약 취소":
      return "bg-[#fcff9c] text-[#ffae00]";
    default:
      return "bg-gray-200 text-gray-600";
  }
};

export default function MyPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "rental");
  const [reservations] = useState<Reservation[]>(MOCK_RENTAL_RESERVATIONS);
  const [plotterReservations] = useState<PlotterReservation[]>(MOCK_PLOTTER_RESERVATIONS);

  // URL 파라미터가 변경되면 탭 업데이트
  useEffect(() => {
    if (tabParam && (tabParam === "rental" || tabParam === "plotter" || tabParam === "profile")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 개인정보 수정 폼 상태
  const [userId] = useState("202112345");
  const [department, setDepartment] = useState("학생복지 위원회");

  const handleEdit = (id: string) => {
    console.log("수정:", id);
  };

  const handleCancel = (id: string) => {
    if (window.confirm("예약을 취소하시겠습니까?")) {
      console.log("취소:", id);
      alert("예약이 취소되었습니다.");
    }
  };

  const handleProfileUpdate = (data: {
    password: string;
    passwordConfirm: string;
    department: string;
  }) => {
    console.log("프로필 수정:", data);
    setDepartment(data.department);
    alert("개인정보가 수정되었습니다.");
  };

  const handleAccountDelete = () => {
    console.log("회원 탈퇴");
    alert("회원 탈퇴가 완료되었습니다.");
  };

  return (
    <>
      <Header />

      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 pt-8">
          {/* 페이지 타이틀 */}
          <div className="flex items-center gap-4 mb-8">
            <svg className="w-9 h-9 text-[#FE6949]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <h1 className="text-[32px] font-bold text-[#410f07]">마이페이지</h1>
          </div>

          {/* 메인 컨텐츠 카드 */}
          <div className="bg-white rounded-[30px] shadow-lg overflow-hidden">
            {/* 탭 헤더 */}
            <div className="bg-[#f4f4f4] flex">
              <button
                onClick={() => setActiveTab("rental")}
                className={`flex-1 py-8 text-[30px] font-medium transition ${
                  activeTab === "rental"
                    ? "bg-[#f72] text-white rounded-tl-[10px]"
                    : "text-[#410f07] bg-transparent"
                }`}
              >
                물품 대여 예약 내역
              </button>
              <button
                onClick={() => setActiveTab("plotter")}
                className={`flex-1 py-8 text-[30px] font-medium transition ${
                  activeTab === "plotter"
                    ? "bg-[#f72] text-white"
                    : "text-[#410f07] bg-transparent"
                }`}
              >
                플로터 예약 내역
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-8 text-[30px] font-medium transition ${
                  activeTab === "profile"
                    ? "bg-[#f72] text-white rounded-tr-[10px]"
                    : "text-[#410f07] bg-transparent"
                }`}
              >
                개인정보 수정
              </button>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="px-11 py-8">
              {activeTab === "rental" && (
                <div className="space-y-5">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-[#b9b9b9] rounded-[21px] p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`${getStatusColor(reservation.status)} px-5 py-2 rounded-[11px] text-[15px] font-medium`}
                            >
                              {reservation.status}
                            </span>
                            <span className="text-[13px] text-[#919191]">
                              {reservation.code}
                            </span>
                          </div>
                          <span className="text-[13px] text-[#919191] ml-3">
                            신청일 {reservation.applicationDate}
                          </span>
                        </div>
                        {reservation.status === "예약" && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(reservation.id)}
                              className="bg-white border border-[#a4a4a4] rounded-[13px] px-6 py-3 text-[20px] hover:bg-gray-50 transition"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="bg-[#ffd2d2] border border-[#ff5151] rounded-[13px] px-6 py-3 text-[20px] text-red-600 hover:bg-[#ffbdbd] transition"
                            >
                              예약 취소
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-[32px] font-semibold text-[#410f07] mb-4">
                        {reservation.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[15px] text-[#5b5b5b]">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8Z" />
                        </svg>
                        <span className="font-medium">
                          {reservation.date}
                          {reservation.items && `   |   ${reservation.items}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "plotter" && (
                <div className="space-y-5">
                  {plotterReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-[#b9b9b9] rounded-[21px] p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`${getPlotterStatusColor(reservation.status)} px-5 py-2 rounded-[11px] text-[15px] font-medium`}
                            >
                              {reservation.status}
                            </span>
                            <span className="text-[13px] text-[#919191]">
                              {reservation.code}
                            </span>
                          </div>
                          <span className="text-[13px] text-[#919191] ml-3">
                            신청일 {reservation.applicationDate}
                          </span>
                        </div>
                        {reservation.status === "예약 대기" && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(reservation.id)}
                              className="bg-white border border-[#a4a4a4] rounded-[13px] px-6 py-3 text-[20px] hover:bg-gray-50 transition"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="bg-[#ffd2d2] border border-[#ff5151] rounded-[13px] px-6 py-3 text-[20px] text-red-600 hover:bg-[#ffbdbd] transition"
                            >
                              예약 취소
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-[32px] font-semibold text-[#410f07] mb-4">
                        {reservation.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[15px] text-[#5b5b5b]">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8Z" />
                        </svg>
                        <span className="font-medium">{reservation.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="flex justify-center py-8">
                  <ProfileEditForm
                    userId={userId}
                    initialDepartment={department}
                    onUpdate={handleProfileUpdate}
                    onDelete={handleAccountDelete}
                  />
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
