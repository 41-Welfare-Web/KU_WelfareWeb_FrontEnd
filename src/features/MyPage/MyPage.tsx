import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TabSelector from "./components/TabSelector";
import RentalContainer from "./components/RentalContainer";
import PlotterContainer from "./components/PlotterContainer";
import ProfileEditForm from "./components/ProfileEditForm";
import myOrangeIcon from "../../assets/mypage/my-orange.svg";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "../../services/userApi";
import { getRentals, cancelRental } from "../../services/rentalApi";
import { getPlotterOrders } from "../../services/plotterApi";

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

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "rental");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [plotterReservations, setPlotterReservations] = useState<PlotterReservation[]>([]);
  
  // 사용자 정보 상태
  const [userProfile, setUserProfile] = useState<{
    username: string;
    name: string;
    studentId: string;
    department: string;
  } | null>(null);
  
  // 로딩 상태
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingRentals, setIsLoadingRentals] = useState(false);
  const [isLoadingPlotter, setIsLoadingPlotter] = useState(false);

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getMyProfile();
        setUserProfile({
          username: profile.username,
          name: profile.name,
          studentId: profile.studentId,
          department: profile.department,
        });
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        alert("로그인이 필요합니다.");
        navigate("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // URL 파라미터가 변경되면 탭 업데이트
  useEffect(() => {
    if (tabParam && (tabParam === "rental" || tabParam === "plotter" || tabParam === "profile")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 대여 내역 조회
  useEffect(() => {
    if (activeTab === "rental" && !isLoadingUser) {
      const fetchRentals = async () => {
        setIsLoadingRentals(true);
        try {
          const response = await getRentals({ pageSize: 100 });
          // API 응답을 화면에 맞게 변환
          const mappedRentals: Reservation[] = response.rentals.map(rental => ({
            id: rental.id.toString(),
            title: rental.itemSummary,
            status: rental.status.toLowerCase() as ReservationStatus,
            code: `RENT-${rental.id}`,
            applicationDate: rental.createdAt.split("T")[0],
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalCount: 1,
          }));
          setReservations(mappedRentals);
        } catch (error) {
          console.error("대여 내역 조회 실패:", error);
        } finally {
          setIsLoadingRentals(false);
        }
      };
      fetchRentals();
    }
  }, [activeTab, isLoadingUser]);

  // 플로터 내역 조회
  useEffect(() => {
    if (activeTab === "plotter" && !isLoadingUser) {
      const fetchPlotterOrders = async () => {
        setIsLoadingPlotter(true);
        try {
          const response = await getPlotterOrders({ pageSize: 100 });
          // API 응답을 화면에 맞게 변환
          const mappedOrders: PlotterReservation[] = response.orders.map(order => ({
            id: order.id.toString(),
            title: order.purpose,
            status: order.status.toLowerCase() as PlotterStatus,
            code: `PLOT-${order.id}`,
            applicationDate: order.createdAt.split("T")[0],
            printDate: order.pickupDate,
          }));
          setPlotterReservations(mappedOrders);
        } catch (error) {
          console.error("플로터 내역 조회 실패:", error);
        } finally {
          setIsLoadingPlotter(false);
        }
      };
      fetchPlotterOrders();
    }
  }, [activeTab, isLoadingUser]);

  const handleEdit = (id: string) => {
    console.log("수정:", id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm("예약을 취소하시겠습니까?")) {
      try {
        await cancelRental(Number(id));
        alert("예약이 취소되었습니다.");
        // 목록 다시 불러오기
        const response = await getRentals({ pageSize: 100 });
        const mappedRentals: Reservation[] = response.rentals.map(rental => ({
          id: rental.id.toString(),
          title: rental.itemSummary,
          status: rental.status.toLowerCase() as ReservationStatus,
          code: `RENT-${rental.id}`,
          applicationDate: rental.createdAt.split("T")[0],
          startDate: rental.startDate,
          endDate: rental.endDate,
          totalCount: 1,
        }));
        setReservations(mappedRentals);
      } catch (error) {
        console.error("예약 취소 실패:", error);
        alert(error instanceof Error ? error.message : "예약 취소에 실패했습니다.");
      }
    }
  };

  const handleProfileUpdate = async (data: {
    password: string;
    passwordConfirm: string;
    department: string;
  }) => {
    try {
      const updatedProfile = await updateMyProfile({
        currentPassword: data.password,
        newPassword: data.passwordConfirm !== data.password ? data.passwordConfirm : undefined,
        department: data.department,
      });
      setUserProfile({
        username: updatedProfile.username,
        name: updatedProfile.name,
        studentId: updatedProfile.studentId,
        department: updatedProfile.department,
      });
      alert("개인정보가 수정되었습니다.");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert(error instanceof Error ? error.message : "정보 수정에 실패했습니다.");
    }
  };

  const handleAccountDelete = async (password: string) => {
    try {
      await deleteMyAccount({ password });
      alert("회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert(error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.");
    }
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

          {/* 로딩 중 */}
          {isLoadingUser && (
            <div className="flex justify-center items-center py-20">
              <p className="text-[20px] text-[#606060]">로딩 중...</p>
            </div>
          )}

          {/* 메인 컨텐츠 카드 */}
          {!isLoadingUser && userProfile && (
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
                    {isLoadingRentals ? (
                      <p className="text-[20px] text-[#606060]">대여 내역을 불러오는 중...</p>
                    ) : reservations.length === 0 ? (
                      <p className="text-[20px] text-[#606060]">대여 내역이 없습니다.</p>
                    ) : (
                      reservations.map((reservation) => (
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
                      ))
                    )}
                  </div>
                )}

                {activeTab === "plotter" && (
                  <div className="space-y-5">
                    {isLoadingPlotter ? (
                      <p className="text-[20px] text-[#606060]">플로터 내역을 불러오는 중...</p>
                    ) : plotterReservations.length === 0 ? (
                      <p className="text-[20px] text-[#606060]">플로터 주문 내역이 없습니다.</p>
                    ) : (
                      plotterReservations.map((reservation) => (
                        <PlotterContainer
                          key={reservation.id}
                          status={reservation.status}
                          reservationNumber={reservation.code}
                          applicationDate={reservation.applicationDate}
                          title={reservation.title}
                          printDate={reservation.printDate}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="flex justify-center py-8">
                    <ProfileEditForm
                      userId={userProfile.studentId}
                      initialDepartment={userProfile.department}
                      onUpdate={handleProfileUpdate}
                      onDelete={handleAccountDelete}
                    />
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
