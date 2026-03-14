import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TabSelector from "../../components/MyPage/TabSelector";
import RentalContainer from "../../components/MyPage/RentalContainer";
import PlotterContainer from "../../components/MyPage/PlotterContainer";
import ProfileEditForm from "../../components/MyPage/ProfileEditForm";
import myOrangeIcon from "../../assets/mypage/my-orange.svg";
import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from "../../services/userApi";
import { getRentals, cancelRental } from "../../services/rentalApi";
import { getPlotterOrders } from "../../services/plotterApi";
import {
  mapRentalStatus,
  mapPlotterStatus,
  type UiRentalStatus,
  type UiPlotterStatus,
} from "../../utils/statusMapper";
import { getRentalDetail } from "../../api/rental/rentalApi";
import { useAuth } from "../../contexts/AuthContext";

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
  items?: Array<{ name: string; quantity: number }>;
};

type PlotterReservation = {
  id: string;
  title: string;
  status: PlotterStatus;
  code: string;
  applicationDate: string;
  printDate: string;
  pageCount: number;
};

export default function MyPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "rental");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [plotterReservations, setPlotterReservations] = useState<
    PlotterReservation[]
  >([]);

  // 사용자 정보 상태
  const [userProfile, setUserProfile] = useState<{
    id: string;
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
          id: profile.id,
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
    if (
      tabParam &&
      (tabParam === "rental" ||
        tabParam === "plotter" ||
        tabParam === "profile")
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 대여 내역 조회
  useEffect(() => {
    if (activeTab === "rental" && !isLoadingUser && userProfile) {
      const fetchRentals = async () => {
        setIsLoadingRentals(true);
        try {
          // 관리자도 마이페이지에서는 본인의 것만 조회
          const response = await getRentals({ userId: userProfile.id, pageSize: 100 });
          console.log("대여 내역 API 응답:", response);
          // API 응답을 화면에 맞게 변환 - 품목별로 분리
          const mappedRentals: Reservation[] = response.rentals.flatMap(
            (rental) => {
              console.log("대여 항목:", rental);
              
              // rentalItems가 있으면 각 품목별로 별도의 reservation 생성
              if (rental.rentalItems && rental.rentalItems.length > 0) {
                return rental.rentalItems.map((rentalItem, index) => ({
                  id: `${rental.id}-${rentalItem.id || index}`,
                  title: rentalItem.item?.name || "대여 항목",
                  status: mapRentalStatus(rental.status),
                  code: `RENT-${rental.id}`,
                  applicationDate: rental.createdAt
                    ? rental.createdAt.split("T")[0]
                    : "",
                  startDate: rental.startDate || "",
                  endDate: rental.endDate || "",
                  totalCount: rentalItem.quantity,
                  items: [{ name: rentalItem.item?.name || '물품', quantity: rentalItem.quantity }],
                }));
              } else {
                // fallback: rentalItems가 없으면 기본값 사용
                return [{
                  id: rental.id.toString(),
                  title: "대여 항목",
                  status: mapRentalStatus(rental.status),
                  code: `RENT-${rental.id}`,
                  applicationDate: rental.createdAt
                    ? rental.createdAt.split("T")[0]
                    : "",
                  startDate: rental.startDate || "",
                  endDate: rental.endDate || "",
                  totalCount: 1,
                }];
              }
            },
          );
          setReservations(mappedRentals);
        } catch (error) {
          console.error("대여 내역 조회 실패:", error);
        } finally {
          setIsLoadingRentals(false);
        }
      };
      fetchRentals();
    }
  }, [activeTab, isLoadingUser, userProfile]);

  // 플로터 내역 조회
  useEffect(() => {
    if (activeTab === "plotter" && !isLoadingUser && userProfile) {
      const fetchPlotterOrders = async () => {
        setIsLoadingPlotter(true);
        try {
          // 관리자도 마이페이지에서는 본인의 것만 조회
          const response = await getPlotterOrders({ userId: userProfile.id, pageSize: 100 });
          console.log("플로터 내역 API 응답:", response);
          // API 응답을 화면에 맞게 변환
          const mappedOrders: PlotterReservation[] = response.orders.map(
            (order) => {
              console.log("플로터 주문:", order);
              return {
                id: order.id.toString(),
                title: order.purpose || "플로터 주문",
                status: mapPlotterStatus(order.status),
                code: `PLOT-${order.id}`,
                applicationDate: order.createdAt || "",
                printDate: order.pickupDate || "",
                pageCount: order.pageCount || 0,
              };
            },
          );
          setPlotterReservations(mappedOrders);
        } catch (error) {
          console.error("플로터 내역 조회 실패:", error);
        } finally {
          setIsLoadingPlotter(false);
        }
      };
      fetchPlotterOrders();
    }
  }, [activeTab, isLoadingUser, userProfile]);

  const handleEdit = async (id: string) => {
    try {
      // id가 "rentalId-itemId" 형식이므로 rentalId만 추출
      const rentalId = parseInt(id.split('-')[0]);
      const rentalDetail = await getRentalDetail(rentalId);
      
      // 대여 수정 페이지로 이동하면서 데이터 전달
      navigate(`/rental/cart?editRentalId=${rentalId}`, {
        state: { rentalDetail }
      });
    } catch (error) {
      console.error("대여 상세 조회 실패:", error);
      alert("대여 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      // id가 "rentalId-itemId" 형식이므로 rentalId만 추출
      const rentalId = parseInt(id.split('-')[0]);
      await cancelRental(rentalId);
      alert("예약이 취소되었습니다.");
      // 목록 새로고침 - 품목별로 분리
      const response = await getRentals({ userId: userProfile?.id, pageSize: 100 });
      const mappedRentals: Reservation[] = response.rentals.flatMap((rental) => {
        if (rental.rentalItems && rental.rentalItems.length > 0) {
          return rental.rentalItems.map((rentalItem, index) => ({
            id: `${rental.id}-${rentalItem.id || index}`,
            title: rentalItem.item?.name || "대여 항목",
            status: mapRentalStatus(rental.status),
            code: `RENT-${rental.id}`,
            applicationDate: rental.createdAt ? rental.createdAt.split("T")[0] : "",
            startDate: rental.startDate || "",
            endDate: rental.endDate || "",
            totalCount: rentalItem.quantity,
            items: [{ name: rentalItem.item?.name || '물품', quantity: rentalItem.quantity }],
          }));
        } else {
          return [{
            id: rental.id.toString(),
            title: "대여 항목",
            status: mapRentalStatus(rental.status),
            code: `RENT-${rental.id}`,
            applicationDate: rental.createdAt ? rental.createdAt.split("T")[0] : "",
            startDate: rental.startDate || "",
            endDate: rental.endDate || "",
            totalCount: 1,
          }];
        }
      });
      setReservations(mappedRentals);
    } catch (error) {
      console.error("예약 취소 실패:", error);
      alert("예약 취소에 실패했습니다.");
    }
  };

  const handleProfileUpdate = async (data: {
    currentPassword: string;
    newPassword?: string;
    departmentType: string;
    departmentName: string;
  }) => {
    try {
      const updateData: any = {
        currentPassword: data.currentPassword,
        departmentType: data.departmentType,
        departmentName: data.departmentName,
      };
      if (data.newPassword) {
        updateData.newPassword = data.newPassword;
      }
      await updateMyProfile(updateData);
      alert("개인정보가 수정되었습니다.");
      
      // 프로필 정보 다시 불러오기
      const profile = await getMyProfile();
      setUserProfile({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        studentId: profile.studentId,
        departmentType: profile.departmentType,
        departmentName: profile.departmentName,
      });
    } catch (error: any) {
      console.error("프로필 수정 실패:", error);
      alert(error.response?.data?.message || "프로필 수정에 실패했습니다.");
    }
  };

  const handleAccountDelete = async (currentPassword: string) => {
    if (!window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deleteMyAccount({ password: currentPassword });
      alert("회원 탈퇴가 완료되었습니다.");
      logout();
      navigate("/");
    } catch (error: any) {
      console.error("회원 탈퇴 실패:", error);
      alert(error.response?.data?.message || "회원 탈퇴에 실패했습니다.");
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
                <div className="w-full">
                  {isLoadingRentals ? (
                    <div className="text-center py-20 text-gray-500">
                      로딩 중...
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      대여 내역이 없습니다.
                    </div>
                  ) : (
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
                          items={reservation.items}
                          onEdit={reservation.status === "reserved" ? () => handleEdit(reservation.id) : undefined}
                          onCancel={reservation.status === "reserved" ? () => handleCancel(reservation.id) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "plotter" && (
                <div className="w-full">
                  {isLoadingPlotter ? (
                    <div className="text-center py-20 text-gray-500">
                      로딩 중...
                    </div>
                  ) : plotterReservations.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      플로터 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {plotterReservations.map((reservation) => (
                        <PlotterContainer
                          key={reservation.id}
                          status={reservation.status}
                          reservationNumber={reservation.code}
                          applicationDate={reservation.applicationDate}
                          title={reservation.title}
                          printDate={reservation.printDate}
                          pageCount={reservation.pageCount}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="flex justify-center py-8 w-full">
                  {isLoadingUser || !userProfile ? (
                    <div className="text-center py-20 text-gray-500">
                      로딩 중...
                    </div>
                  ) : (
                    <ProfileEditForm
                      userId={userProfile.username}
                      initialDepartmentType={userProfile.departmentType}
                      initialDepartmentName={userProfile.departmentName}
                      onUpdate={handleProfileUpdate}
                      onDelete={handleAccountDelete}
                    />
                  )}
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
