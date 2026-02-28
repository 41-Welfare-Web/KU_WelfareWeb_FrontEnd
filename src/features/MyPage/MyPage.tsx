import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TabSelector from "../../components/MyPage/TabSelector";
import RentalContainer from "../../components/MyPage/RentalContainer";
import PlotterContainer from "../../components/MyPage/PlotterContainer";
import ProfileEditForm from "../../components/MyPage/ProfileEditForm";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import myOrangeIcon from "../../assets/mypage/my-orange.svg";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "../../services/userApi";
import { getRentals, cancelRental } from "../../services/rentalApi";
import { getPlotterOrders } from "../../services/plotterApi";
import { mapRentalStatus, mapPlotterStatus, type UiRentalStatus, type UiPlotterStatus } from "../../utils/statusMapper";

type ReservationStatus = UiRentalStatus;
type PlotterStatus = UiPlotterStatus;
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
    departmentType: string;
    departmentName: string;
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
          departmentType: profile.departmentType,
          departmentName: profile.departmentName,
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
          console.log("대여 내역 API 응답:", response);
          // API 응답을 화면에 맞게 변환
          const mappedRentals: Reservation[] = response.rentals.map(rental => {
            console.log("대여 항목:", rental);
            return {
              id: rental.id.toString(),
              title: rental.itemSummary || '대여 항목',
              status: mapRentalStatus(rental.status),
              code: `RENT-${rental.id}`,
              applicationDate: rental.createdAt ? rental.createdAt.split("T")[0] : '',
              startDate: rental.startDate || '',
              endDate: rental.endDate || '',
              totalCount: 1,
            };
          });
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
          console.log("플로터 내역 API 응답:", response);
          // API 응답을 화면에 맞게 변환
          const mappedOrders: PlotterReservation[] = response.orders.map(order => {
            console.log("플로터 주문:", order);
            return {
              id: order.id.toString(),
              title: order.purpose || '플로터 주문',
              status: mapPlotterStatus(order.status),
              code: `PLOT-${order.id}`,
              applicationDate: order.createdAt || '',
              printDate: order.pickupDate || '',
            };
          });
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
    currentPassword: string;
    newPassword?: string;
    departmentType: string;
    departmentName: string;
  }) => {
    try {
      const updatedProfile = await updateMyProfile({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        departmentType: data.departmentType,
        departmentName: data.departmentName,
      });
      setUserProfile({
        username: updatedProfile.username,
        name: updatedProfile.name,
        studentId: updatedProfile.studentId,
        departmentType: updatedProfile.departmentType,
        departmentName: updatedProfile.departmentName,
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
        <div className="max-w-[1440px] mx-auto px-4 pt-4 md:pt-8">
          {/* 페이지 타이틀 */}
          <div className="flex items-center gap-4 mb-4 md:mb-8">
            <img src={myOrangeIcon} alt="user" className="w-7 h-7 md:w-9 md:h-9" />
            <h1 className="text-[24px] md:text-[32px] font-bold text-[#410f07]">마이페이지</h1>
          </div>

          {/* 로딩 중 */}
          {isLoadingUser && <LoadingState />}

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
              <div className="px-3 py-3 md:px-11 md:py-8 bg-white min-h-[400px] flex flex-col items-center">
                {activeTab === "rental" && (
                  <div className="space-y-3 md:space-y-5 w-full pt-3 md:pt-0">
                    {isLoadingRentals ? (
                      <LoadingState message="대여 내역을 불러오는 중..." />
                    ) : reservations.length === 0 ? (
                      <EmptyState message="대여 내역이 없습니다." />
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
                  <div className="space-y-3 md:space-y-5 w-full pt-3 md:pt-0">
                    {isLoadingPlotter ? (
                      <LoadingState message="플로터 내역을 불러오는 중..." />
                    ) : plotterReservations.length === 0 ? (
                      <EmptyState message="플로터 주문 내역이 없습니다." />
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
                  <div className="w-full">
                    <ProfileEditForm
                      userId={userProfile.studentId}
                      initialDepartmentType={userProfile.departmentType}
                      initialDepartmentName={userProfile.departmentName}
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
