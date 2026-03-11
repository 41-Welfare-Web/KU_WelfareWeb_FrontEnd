import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminRentalRow from "../../components/Admin/AdminRentalRow";
import AdminPlotterRow from "../../components/Admin/AdminPlotterRow";
import AdminFilterBar from "../../components/Admin/AdminFilterBar";
import AdminPlotterFilterBar from "../../components/Admin/AdminPlotterFilterBar";
import AdminItemsFilterBar from "../../components/Admin/AdminItemsFilterBar";
import PlotterRejectHandler from "../../components/Admin/PlotterRejectHandler";
import type { PlotterRejectHandlerRef } from "../../components/Admin/PlotterRejectHandler";
import AdminTabNavigation from "../../components/Admin/AdminTabNavigation";
import AdminItemCard from "../../components/Admin/AdminItemCard";
import AdminTableHeader from "../../components/Admin/AdminTableHeader";
import AdminDashboardHeader from "../../components/Admin/AdminDashboardHeader";
import { useExportCSV } from "../../hooks/useExportCSV";
import { getRentals } from "../../services/rentalApi";
import { getPlotterOrders } from "../../services/plotterApi";
import { getCategories, getItems } from "../../api/rental/rentalApi";
import type { Item, Category } from "../../api/rental/types";
import axiosInstance from "../../api/axiosInstance";
import AdminItemCreateModal from "../../components/Admin/AdminItemCreateModal";

type TabType = "rental" | "plotter" | "items";

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
    department?: string;
    departmentName?: string;
    departmentType?: string;
  };
  departmentName?: string;
  departmentType?: string;
  startDate: string;
  endDate: string;
  status:
    | "RESERVED"
    | "RENTED"
    | "RETURNED"
    | "OVERDUE"
    | "CANCELED"
    | "DEFECTIVE";
  itemSummary: string;
  memo: string | null;
  createdAt: string;
  rentalItems?: Array<{
    id: number;
    quantity: number;
    item?: { name: string };
  }>;
}

interface PlotterData {
  id: number;
  user?: {
    name: string;
    studentId: string;
    department?: string;
    departmentName?: string;
  };
  departmentType?: string;
  departmentName?: string;
  purpose: string;
  paperSize: string;
  pageCount: number;
  pickupDate: string;
  status: string;
  memo: string | null;
  createdAt: string;
  fileUrl?: string;
  originalFilename?: string;
}

// ItemData와 CategoryData는 API 타입 사용
type ItemData = Item;
type CategoryData = Category;

// 대여 상태 매핑 (API <-> 컴포넌트)
const RENTAL_STATUS_MAP: Record<string, string> = {
  예약: "RESERVED",
  "대여 중": "RENTED",
  "정상 반납": "RETURNED",
  "불량 반납": "DEFECTIVE",
  "예약 취소": "CANCELED",
};
const RENTAL_STATUS_MAP_REVERSE: Record<
  "RESERVED" | "RENTED" | "RETURNED" | "OVERDUE" | "CANCELED" | "DEFECTIVE",
  "reserved" | "renting" | "returned" | "overdue" | "canceled" | "defective"
> = {
  RESERVED: "reserved",
  RENTED: "renting",
  RETURNED: "returned",
  OVERDUE: "overdue",
  CANCELED: "canceled",
  DEFECTIVE: "defective",
};
// 플로터 상태 매핑 (API <-> 컴포넌트)
const PLOTTER_STATUS_MAP: Record<string, string> = {
  "예약 대기": "PENDING",
  "예약 확정": "CONFIRMED",
  "인쇄 완료": "PRINTED",
  "예약 반려": "REJECTED",
  "수령 완료": "COMPLETED",
};
const PLOTTER_STATUS_MAP_REVERSE: Record<
  "PENDING" | "CONFIRMED" | "PRINTED" | "REJECTED" | "COMPLETED",
  "pending" | "confirmed" | "printed" | "rejected" | "completed"
> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PRINTED: "printed",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total === 0) return null;

  // 현재 그룹(데스크톱 10개, 모바일 5개 단위)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const groupSize = isMobile ? 5 : 10;
  const groupStart = Math.floor((page - 1) / groupSize) * groupSize + 1;
  const groupEnd = Math.min(groupStart + groupSize - 1, totalPages);
  const pages = Array.from(
    { length: groupEnd - groupStart + 1 },
    (_, i) => groupStart + i,
  );

  return (
    <div className="flex flex-col items-center gap-2 mt-[18px] mb-[10px]">
      <p className="text-xs sm:text-sm text-gray-500">
        총 <span className="font-semibold text-gray-700">{total}</span>건
        &nbsp;|&nbsp; 현재 페이지{" "}
        <span className="font-semibold text-gray-700">{page}</span> /{" "}
        {totalPages}
      </p>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {/* 처음 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded disabled:opacity-30 hover:bg-gray-100"
        >
          {"<<"}
        </button>
        {/* 이전 */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded disabled:opacity-30 hover:bg-gray-100"
        >
          {"<"}
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded font-medium transition-colors ${
              p === page
                ? "bg-[#fe6949] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        {/* 다음 */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded disabled:opacity-30 hover:bg-gray-100"
        >
          {">"}
        </button>
        {/* 마지막 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded disabled:opacity-30 hover:bg-gray-100"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const rejectHandlerRef = useRef<PlotterRejectHandlerRef>(null);
  const { exportCSV } = useExportCSV();
  const [activeTab, setActiveTab] = useState<TabType>("rental");
  const [rentalStatusFilter, setRentalStatusFilter] = useState("전체 보기");
  const [plotterStatusFilter, setPlotterStatusFilter] = useState("전체 상태");
  const [rentalSearchQuery, setRentalSearchQuery] = useState("");
  const [plotterSearchQuery, setPlotterSearchQuery] = useState("");
  const [rentalStartDate, setRentalStartDate] = useState("");
  const [rentalEndDate, setRentalEndDate] = useState("");
  const [itemsCategoryFilter, setItemsCategoryFilter] = useState("전체");
  const [itemsSearchQuery, setItemsSearchQuery] = useState("");
  const [rentalData, setRentalData] = useState<RentalData[]>([]);
  const [plotterData, setPlotterData] = useState<PlotterData[]>([]);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemCreateModalOpen, setItemCreateModalOpen] = useState(false);

  const PAGE_SIZE = 20;
  const [rentalPage, setRentalPage] = useState(1);
  const [plotterPage, setPlotterPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Admin] 대여 목록 조회 시작");
      const response = await getRentals({
        page: 1,
        pageSize: 1000,
      });
      console.log("[Admin] 대여 목록 조회 성공:", response);

      setRentalData(response.rentals || []);
    } catch (err: any) {
      console.error("[Admin] 대여 목록 조회 실패:", err);
      console.error("[Admin] 에러 상세:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.message ||
          "대여 목록을 불러오는데 실패했습니다. 관리자 권한이 필요합니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPlotterOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Admin] 플로터 목록 조회 시작");
      const response = await getPlotterOrders({
        page: 1,
        pageSize: 1000,
      });
      console.log("[Admin] 플로터 목록 조회 성공:", response);

      setPlotterData(response.orders || []);
    } catch (err: any) {
      console.error("[Admin] 플로터 목록 조회 실패:", err);
      console.error("[Admin] 에러 상세:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.message ||
          "플로터 목록을 불러오는데 실패했습니다. 관리자 권한이 필요합니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Admin] 물품 목록 조회 시작");
      const response = await getItems({
        search: itemsSearchQuery.trim() || undefined,
      });
      console.log("[Admin] 물품 목록 조회 성공:", response);

      setItemsData(response || []);
    } catch (err: any) {
      console.error("[Admin] 물품 목록 조회 실패:", err);
      console.error("[Admin] 에러 상세:", err);
      setError(
        err instanceof Error
          ? err.message
          : "물품 목록을 불러오는데 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response || []);
    } catch (err: any) {
      console.error("카테고리 목록 조회 실패:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "rental") {
      fetchRentals();
    } else if (activeTab === "plotter") {
      fetchPlotterOrders();
    } else if (activeTab === "items") {
      fetchItems();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // 필터/검색 변경 시 페이지 리셋
  useEffect(() => {
    setRentalPage(1);
  }, [rentalStatusFilter, rentalSearchQuery, rentalStartDate, rentalEndDate]);
  useEffect(() => {
    setPlotterPage(1);
  }, [plotterStatusFilter, plotterSearchQuery]);
  useEffect(() => {
    setItemsPage(1);
  }, [itemsCategoryFilter, itemsSearchQuery]);

  const handleRentalStatusChange = async (
    rentalId: number,
    newStatus: string,
  ) => {
    try {
      await axiosInstance.put(`/api/rentals/${rentalId}/status`, {
        status: newStatus,
      });
      alert("상태가 변경되었습니다.");
      fetchRentals();
    } catch (err: any) {
      console.error("상태 변경 실패:", err);
      alert(err.response?.data?.message || "상태 변경에 실패했습니다.");
    }
  };

  const handleRentalNoteChange = async (
    rentalId: number,
    currentStatus: string,
    newMemo: string,
  ) => {
    try {
      await axiosInstance.put(`/api/rentals/${rentalId}/status`, {
        status: currentStatus,
        memo: newMemo,
      });
      // 전체 목록을 다시 가져오지 않고 해당 항목의 memo만 업데이트
      setRentalData((prev) =>
        prev.map((rental) =>
          rental.id === rentalId ? { ...rental, memo: newMemo } : rental,
        ),
      );
    } catch (err: any) {
      console.error("비고 변경 실패:", err);
      alert(err.response?.data?.message || "비고 변경에 실패했습니다.");
    }
  };

  const handlePlotterStatusChange = async (
    orderId: number,
    newStatus: string,
    rejectReason?: string,
  ) => {
    // 반려(REJECTED) 상태로 변경 시 사유가 없거나 공백일 때만 모달 오픈
    if (newStatus === "REJECTED" && (!rejectReason || !rejectReason.trim())) {
      if (rejectHandlerRef.current) {
        rejectHandlerRef.current.requestReject(orderId, newStatus);
      }
      return;
    }
    // rejectReason이 있으면 무조건 API 호출
    try {
      console.log("[API 호출]", {
        orderId,
        newStatus,
        rejectReason,
      });
      const payload: any = { status: newStatus };
      if (newStatus === "REJECTED" && rejectReason && rejectReason.trim()) {
        payload.rejectionReason = rejectReason.trim();
      }
      await axiosInstance.put(`/api/plotter/orders/${orderId}/status`, payload);
      alert("상태가 변경되었습니다.");
      fetchPlotterOrders();
    } catch (err: any) {
      console.error("상태 변경 실패:", err);
      alert(err.response?.data?.message || "상태 변경에 실패했습니다.");
    }
  };

  const handlePlotterNoteChange = async (
    orderId: number,
    currentStatus: string,
    newMemo: string,
  ) => {
    try {
      await axiosInstance.put(`/api/plotter/orders/${orderId}/status`, {
        status: currentStatus,
        memo: newMemo,
      });
      // 전체 목록을 다시 가져오지 않고 해당 항목의 memo만 업데이트
      setPlotterData((prev) =>
        prev.map((plotter) =>
          plotter.id === orderId ? { ...plotter, memo: newMemo } : plotter,
        ),
      );
    } catch (err: any) {
      console.error("비고 변경 실패:", err);
      alert(err.response?.data?.message || "비고 변경에 실패했습니다.");
    }
  };

  const handleRentalSearch = () => {
    fetchRentals();
  };

  const handlePlotterSearch = () => {
    fetchPlotterOrders();
  };

  const handleItemsSearch = () => {
    fetchItems();
  };

  const handleItemEdit = async (_itemId: number) => {
    alert("물품 수정 기능은 별도 페이지가 필요합니다. 준비 중입니다.");
  };

  const handleItemDelete = async (itemId: number) => {
    if (!window.confirm("이 물품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/items/${itemId}`);
      alert("물품이 삭제되었습니다.");
      fetchItems();
    } catch (err: any) {
      console.error("물품 삭제 실패:", err);
      alert(err.response?.data?.message || "물품 삭제에 실패했습니다.");
    }
  };

  const handleDownload = () => {
    exportCSV(activeTab, rentalData, plotterData);
  };

  const filteredRentalData = rentalData.filter((item) => {
    // 상태 필터링
    let statusMatch = true;
    if (rentalStatusFilter !== "전체 보기") {
      if (rentalStatusFilter === "불량 반납") {
        statusMatch = item.status === "DEFECTIVE" || item.status === "OVERDUE";
      } else {
        statusMatch = item.status === RENTAL_STATUS_MAP[rentalStatusFilter];
      }
    }

    // 날짜 필터
    let dateMatch = true;
    if (rentalStartDate) {
      const itemStart = item.startDate.slice(0, 10);
      dateMatch = dateMatch && itemStart >= rentalStartDate;
    }
    if (rentalEndDate) {
      const itemEnd = item.endDate.slice(0, 10);
      dateMatch = dateMatch && itemEnd <= rentalEndDate;
    }

    // 검색어 필터
    if (!rentalSearchQuery.trim()) return statusMatch && dateMatch;
    const query = rentalSearchQuery.replace(/\s+/g, "").toLowerCase();
    const norm = (s: string | null | undefined) =>
      (s ?? "").replace(/\s+/g, "").toLowerCase();
    const departmentName = item.departmentName || item.departmentType || "";
    const searchMatch =
      norm(item.user?.name).includes(query) ||
      (item.user?.studentId || "").includes(query) ||
      norm(departmentName).includes(query) ||
      norm(item.itemSummary).includes(query) ||
      norm(`RENT-${item.id}`).includes(query);
    return statusMatch && dateMatch && searchMatch;
  });

  const filteredPlotterData = plotterData.filter((item) => {
    // 상태 필터링
    let statusMatch = true;
    if (plotterStatusFilter !== "전체 상태") {
      statusMatch = item.status === PLOTTER_STATUS_MAP[plotterStatusFilter];
    }

    // 검색어 필터링
    if (!plotterSearchQuery.trim()) return statusMatch;
    const query = plotterSearchQuery.replace(/\s+/g, "").toLowerCase();
    const norm = (s: string | null | undefined) =>
      (s ?? "").replace(/\s+/g, "").toLowerCase();
    const userName = item.user?.name || "";
    const studentId = item.user?.studentId || "";
    const departmentName =
      item.departmentName ||
      item.user?.departmentName ||
      item.departmentType ||
      "";
    const searchMatch =
      norm(userName).includes(query) ||
      studentId.includes(query) ||
      norm(departmentName).includes(query) ||
      norm(item.purpose).includes(query) ||
      norm(item.paperSize).includes(query) ||
      norm(`PLOT-${item.id}`).includes(query);
    return statusMatch && searchMatch;
  });

  const filteredItemsData = itemsData.filter((item) => {
    // 카테고리 필터링
    let categoryMatch = true;
    if (itemsCategoryFilter !== "전체") {
      categoryMatch = item.category.name === itemsCategoryFilter;
    }

    // 검색어 필터링
    if (!itemsSearchQuery.trim()) return categoryMatch;
    const query = itemsSearchQuery.replace(/\s+/g, "").toLowerCase();
    const norm = (s: string | null | undefined) =>
      (s ?? "").replace(/\s+/g, "").toLowerCase();
    const searchMatch =
      norm(item.name).includes(query) ||
      norm(item.itemCode).includes(query) ||
      norm(item.description).includes(query);
    return categoryMatch && searchMatch;
  });

  const paginatedRentalData = filteredRentalData.slice(
    (rentalPage - 1) * PAGE_SIZE,
    rentalPage * PAGE_SIZE,
  );
  const paginatedPlotterData = filteredPlotterData.slice(
    (plotterPage - 1) * PAGE_SIZE,
    plotterPage * PAGE_SIZE,
  );
  const paginatedItemsData = filteredItemsData.slice(
    (itemsPage - 1) * PAGE_SIZE,
    itemsPage * PAGE_SIZE,
  );

  return (
    <>
      <Header />

      <div className="w-full overflow-x-hidden bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 md:pt-8">
          {/* 상단 영역: 타이틀과 버튼들 */}
          <AdminDashboardHeader
            activeTab={activeTab}
            onDownload={handleDownload}
            onAddItem={() => setItemCreateModalOpen(true)}
          />

          {/* 탭과 내용을 감싸는 박스 */}
          <div className="bg-white rounded-[20px] p-4 md:p-8 shadow-sm">
            {/* 탭 네비게이션 */}
            <AdminTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* 대여 관리 탭 내용 */}
            {activeTab === "rental" && (
              <div>
                {/* 필터 바 */}
                <AdminFilterBar
                  statusOptions={[
                    "전체 보기",
                    "예약",
                    "대여 중",
                    "정상 반납",
                    "불량 반납",
                    "예약 취소",
                  ]}
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
                <div className="overflow-x-auto overflow-y-visible mt-4 md:mt-6">
                  <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible md:min-w-[680px]">
                    {/* 테이블 헤더 */}
                    <AdminTableHeader
                      columns={[
                        { label: "신청번호", width: "w-[7%] min-w-0" },
                        { label: "신청자", width: "w-[8%] min-w-0" },
                        { label: "소속", width: "w-[12%] min-w-0" },
                        { label: "대여 품목", width: "flex-1 min-w-0" },
                        { label: "수량", width: "w-[6%] min-w-0" },
                        { label: "대여 날짜", width: "w-[10%] min-w-0" },
                        { label: "반납 날짜", width: "w-[10%] min-w-0" },
                        { label: "상태", width: "w-[9%] min-w-0" },
                        { label: "비고", width: "w-[12%] min-w-0" },
                      ]}
                    />

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
                            <span className="text-gray-500">
                              {rentalSearchQuery
                                ? "검색 결과가 없습니다."
                                : "대여 내역이 없습니다."}
                            </span>
                          </div>
                        ) : (
                          paginatedRentalData.flatMap((rental) => {
                            // status 매핑: RENTED -> renting
                            const mappedStatus = RENTAL_STATUS_MAP_REVERSE[
                              rental.status
                            ] as
                              | "reserved"
                              | "renting"
                              | "returned"
                              | "overdue"
                              | "canceled"
                              | "defective";

                            // rentalItems가 있으면 각 품목별로 분리해서 표시
                            if (
                              rental.rentalItems &&
                              rental.rentalItems.length > 0
                            ) {
                              return rental.rentalItems.map(
                                (rentalItem, index) => (
                                  <AdminRentalRow
                                    key={`${rental.id}-${rentalItem.id || index}`}
                                    rentalCode={`R-${rental.id}`}
                                    userName={rental.user.name}
                                    department={
                                      rental.departmentName ||
                                      rental.departmentType ||
                                      "-"
                                    }
                                    itemName={rentalItem.item?.name || "-"}
                                    quantity={rentalItem.quantity}
                                    startDate={rental.startDate}
                                    endDate={rental.endDate}
                                    status={mappedStatus}
                                    note={rental.memo || ""}
                                    onStatusChange={(newStatus) => {
                                      handleRentalStatusChange(
                                        rental.id,
                                        (
                                          Object.keys(
                                            RENTAL_STATUS_MAP_REVERSE,
                                          ) as Array<
                                            keyof typeof RENTAL_STATUS_MAP_REVERSE
                                          >
                                        ).find(
                                          (k) =>
                                            RENTAL_STATUS_MAP_REVERSE[k] ===
                                            newStatus,
                                        ) || "RESERVED",
                                      );
                                    }}
                                    onNoteChange={(newNote) => {
                                      handleRentalNoteChange(
                                        rental.id,
                                        rental.status,
                                        newNote,
                                      );
                                    }}
                                  />
                                ),
                              );
                            } else {
                              // fallback: rentalItems가 없으면 기존 방식으로 표시
                              return (
                                <AdminRentalRow
                                  key={rental.id}
                                  rentalCode={`R-${rental.id}`}
                                  userName={rental.user.name}
                                  department={
                                    rental.departmentName ||
                                    rental.departmentType ||
                                    "-"
                                  }
                                  itemName={
                                    rental.itemSummary?.replace(
                                      /\s*외\s*0건$/,
                                      "",
                                    ) || "-"
                                  }
                                  quantity={undefined}
                                  startDate={rental.startDate}
                                  endDate={rental.endDate}
                                  status={mappedStatus}
                                  note={rental.memo || ""}
                                  onStatusChange={(newStatus) => {
                                    handleRentalStatusChange(
                                      rental.id,
                                      (
                                        Object.keys(
                                          RENTAL_STATUS_MAP_REVERSE,
                                        ) as Array<
                                          keyof typeof RENTAL_STATUS_MAP_REVERSE
                                        >
                                      ).find(
                                        (k) =>
                                          RENTAL_STATUS_MAP_REVERSE[k] ===
                                          newStatus,
                                      ) || "RESERVED",
                                    );
                                  }}
                                  onNoteChange={(newNote) => {
                                    handleRentalNoteChange(
                                      rental.id,
                                      rental.status,
                                      newNote,
                                    );
                                  }}
                                />
                              );
                            }
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!loading && !error && filteredRentalData.length > 0 && (
                  <Pagination
                    total={filteredRentalData.length}
                    page={rentalPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={setRentalPage}
                  />
                )}
              </div>
            )}

            {/* 플로터 관리 탭 내용 */}
            {activeTab === "plotter" && (
              <div>
                {/* 필터 바 */}
                <AdminPlotterFilterBar
                  statusOptions={[
                    "전체 상태",
                    "예약 대기",
                    "예약 확정",
                    "출력 완료",
                    "예약 반려",
                    "수령 완료",
                  ]}
                  selectedStatus={plotterStatusFilter}
                  onStatusChange={setPlotterStatusFilter}
                  searchQuery={plotterSearchQuery}
                  onSearchQueryChange={setPlotterSearchQuery}
                  onSearch={handlePlotterSearch}
                  searchPlaceholder="이름, 학과 검색"
                />

                {/* 테이블 */}
                <div className="overflow-x-auto overflow-y-visible mt-4 md:mt-6">
                  <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible md:min-w-[680px]">
                    {/* 테이블 헤더 */}
                    <AdminTableHeader
                      columns={[
                        { label: "신청번호", width: "w-[7%] min-w-0" },
                        { label: "신청자", width: "w-[8%] min-w-0" },
                        { label: "소속", width: "w-[12%] min-w-0" },
                        { label: "파일명", width: "flex-1 min-w-0" },
                        { label: "용지/장수", width: "w-[10%] min-w-0" },
                        { label: "수령일", width: "w-[10%] min-w-0" },
                        { label: "상태", width: "w-[9%] min-w-0" },
                        { label: "비고", width: "w-[13%] min-w-0" },
                      ]}
                    />

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
                            <span className="text-gray-500">
                              {plotterSearchQuery
                                ? "검색 결과가 없습니다."
                                : "플로터 주문 내역이 없습니다."}
                            </span>
                          </div>
                        ) : (
                          paginatedPlotterData.map((plotter) => {
                            // status 매핑: PRINTED -> printing, PENDING -> pending
                            return (
                              <AdminPlotterRow
                                key={plotter.id}
                                orderCode={`P-${plotter.id}`}
                                userName={
                                  plotter.user?.name || "사용자 정보 없음"
                                }
                                club={
                                  plotter.departmentName ||
                                  plotter.departmentType ||
                                  "-"
                                }
                                purpose={plotter.purpose}
                                paperSizeAndCount={`${plotter.paperSize} / ${plotter.pageCount}장`}
                                orderDate={plotter.pickupDate}
                                status={
                                  PLOTTER_STATUS_MAP_REVERSE[
                                    plotter.status as keyof typeof PLOTTER_STATUS_MAP_REVERSE
                                  ] as
                                    | "pending"
                                    | "confirmed"
                                    | "printed"
                                    | "rejected"
                                    | "completed"
                                }
                                note={plotter.memo || ""}
                                fileUrl={plotter.fileUrl}
                                onStatusChange={(newStatus) => {
                                  handlePlotterStatusChange(
                                    plotter.id,
                                    (
                                      Object.keys(
                                        PLOTTER_STATUS_MAP_REVERSE,
                                      ) as Array<
                                        keyof typeof PLOTTER_STATUS_MAP_REVERSE
                                      >
                                    ).find(
                                      (k) =>
                                        PLOTTER_STATUS_MAP_REVERSE[k] ===
                                        newStatus,
                                    ) || "PENDING",
                                  );
                                }}
                                onNoteChange={(newNote) => {
                                  handlePlotterNoteChange(
                                    plotter.id,
                                    plotter.status,
                                    newNote,
                                  );
                                }}
                              />
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!loading && !error && filteredPlotterData.length > 0 && (
                  <Pagination
                    total={filteredPlotterData.length}
                    page={plotterPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPlotterPage}
                  />
                )}
              </div>
            )}

            {/* 물품 목록 관리 탭 내용 */}
            {activeTab === "items" && (
              <div>
                {/* 카테고리 필터 바 */}
                <AdminItemsFilterBar
                  categories={["전체", ...categories.map((c) => c.name)]}
                  selectedCategory={itemsCategoryFilter}
                  onCategoryChange={setItemsCategoryFilter}
                  searchQuery={itemsSearchQuery}
                  onSearchQueryChange={setItemsSearchQuery}
                  onSearch={handleItemsSearch}
                  searchPlaceholder="물품 검색"
                />

                {loading && (
                  <div className="h-[400px] flex items-center justify-center">
                    <span className="text-gray-500 text-lg">로딩 중...</span>
                  </div>
                )}

                {!loading && error && (
                  <div className="h-[400px] flex items-center justify-center">
                    <span className="text-red-500 text-lg">{error}</span>
                  </div>
                )}

                {!loading && !error && filteredItemsData.length === 0 && (
                  <div className="h-[400px] flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      등록된 물품이 없습니다.
                    </span>
                  </div>
                )}

                {!loading && !error && filteredItemsData.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-[16px] sm:gap-x-[30px] lg:gap-x-[53px] gap-y-[20px] md:gap-y-[30px]">
                    {paginatedItemsData.map((item) => (
                      <AdminItemCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        category={item.category.name}
                        description={item.description || ""}
                        quantity={item.totalQuantity}
                        imageUrl={item.imageUrl || undefined}
                        onEdit={handleItemEdit}
                        onDelete={handleItemDelete}
                      />
                    ))}
                  </div>
                )}
                {!loading && !error && filteredItemsData.length > 0 && (
                  <Pagination
                    total={filteredItemsData.length}
                    page={itemsPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={setItemsPage}
                  />
                )}
              </div>
            )}
          </div>
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
      <AdminItemCreateModal
        open={itemCreateModalOpen}
        onClose={() => setItemCreateModalOpen(false)}
        onSuccess={fetchItems}
      />
    </>
  );
}

export default AdminDashboard;
