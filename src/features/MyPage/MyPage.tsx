import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TabSelector from "../../components/ui/TabSelector";
import RentalContainer from "../../components/ui/RentalContainer";
import PlotterContainer from "../../components/ui/PlotterContainer";
import ProfileEditForm from "../../components/ui/ProfileEditForm";
import myOrangeIcon from "../../assets/mypage/my-orange.svg";

type ReservationStatus = 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled';
type PlotterStatus = 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';
type TabType = "rental" | "plotter" | "profile";

type Reservation = {
  id: string;
  title: string;
  status: ReservationStatus;
  code: string;
  applicationDate: string;
  startDate: string;
  endDate: string;
  totalCount: number;
};

type PlotterReservation = {
  id: string;
  title: string;
  status: PlotterStatus;
  code: string;
  applicationDate: string;
  printDate: string;
};

const MOCK_RENTAL_RESERVATIONS: Reservation[] = [
  {
    id: "1",
    title: "행사용 현수막",
    status: "reserved",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    startDate: "2026-01-10",
    endDate: "2026-01-14",
    totalCount: 1,
  },
  {
    id: "2",
    title: "행사용 현수막",
    status: "returned",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    startDate: "2026-01-10",
    endDate: "2026-01-14",
    totalCount: 1,
  },
  {
    id: "3",
    title: "행사용 현수막",
    status: "renting",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    startDate: "2026-01-10",
    endDate: "2026-01-14",
    totalCount: 1,
  },
  {
    id: "4",
    title: "행사용 현수막",
    status: "defective",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    startDate: "2026-01-10",
    endDate: "2026-01-14",
    totalCount: 1,
  },
];

const MOCK_PLOTTER_RESERVATIONS: PlotterReservation[] = [
  {
    id: "1",
    title: "대자보 플로터 인쇄",
    status: "waiting",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    printDate: "2026-01-14",
  },
  {
    id: "2",
    title: "대자보 플로터 인쇄",
    status: "completed",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    printDate: "2026-01-14",
  },
  {
    id: "3",
    title: "대자보 플로터 인쇄",
    status: "confirmed",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    printDate: "2026-01-14",
  },
  {
    id: "4",
    title: "대자보 플로터 인쇄",
    status: "printing",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    printDate: "2026-01-14",
  },
  {
    id: "5",
    title: "대자보 플로터 인쇄",
    status: "rejected",
    code: "HBW-202612345",
    applicationDate: "2026-01-05",
    printDate: "2026-01-14",
  },
];

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
            <img src={myOrangeIcon} alt="user" className="w-9 h-9" />
            <h1 className="text-[32px] font-bold text-[#410f07]">마이페이지</h1>
          </div>

          {/* 메인 컨텐츠 카드 */}
          <div className="rounded-[30px] bg-[#f4f4f4] overflow-hidden">
            {/* 탭 헤더 */}
            <div className="bg-[#f4f4f4] flex mr-10">
              <TabSelector 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />
            </div>

            {/* 탭 컨텐츠 */}
            <div className="px-11 py-8 bg-white min-h-[400px] flex flex-col items-center">
              {activeTab === "rental" && (
                <div className="space-y-5">
                  {reservations.map((reservation) => (
                    <RentalContainer
                      key={reservation.id}
                      status={reservation.status}
                      reservationNumber={reservation.code}
                      applicationDate={reservation.applicationDate}
                      title={reservation.title}
                      itemCount={0}
                      startDate={reservation.startDate}
                      endDate={reservation.endDate}
                      totalCount={reservation.totalCount}
                      onEdit={reservation.status === "reserved" ? () => handleEdit(reservation.id) : undefined}
                      onCancel={reservation.status === "reserved" ? () => handleCancel(reservation.id) : undefined}
                    />
                  ))}
                </div>
              )}

              {activeTab === "plotter" && (
                <div className="space-y-5">
                  {plotterReservations.map((reservation) => (
                    <PlotterContainer
                      key={reservation.id}
                      status={reservation.status}
                      reservationNumber={reservation.code}
                      applicationDate={reservation.applicationDate}
                      title={reservation.title}
                      printDate={reservation.printDate}
                    />
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
