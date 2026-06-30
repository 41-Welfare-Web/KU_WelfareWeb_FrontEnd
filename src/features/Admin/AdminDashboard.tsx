import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { getCommonMetadata } from "../../services/commonApi";
import { getCategories, getItems } from "../../api/rental/rentalApi";
import type { Item, Category } from "../../api/rental/types";
import axiosInstance from "../../api/axiosInstance";
import AdminItemCreateModal from "../../components/Admin/AdminItemCreateModal";
import AdminUserSelectModal from "../../components/Admin/AdminUserSelectModal";
import sortIcon from "../../assets/admin/sort.svg";

type TabType = "rental" | "plotter" | "items";

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
    phoneNumber?: string;
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
  itemSummary?: string;
  quantity?: number;
  memo?: string | null;
  createdAt: string;
  rentalItems: import("../../api/rental/types").RentalRentalItem[];
}

interface PlotterData {
  id: number;
  user?: {
    name: string;
    studentId: string;
    phoneNumber?: string;
    department?: string;
    departmentName?: string;
  };
  departmentType?: string;
  departmentName?: string;
  purpose: string;
  paperSize: string;
  pageCount: number;
  orderQuantity?: number;
  pickupDate: string;
  status: string;
  createdAt: string;
  fileUrl?: string;
  originalFilename?: string;
  memo?: string | null;
  isPaidService?: boolean;
  price?: number;
  paymentReceiptUrl?: string;
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
        &nbsp;|&nbsp; 현재 페이지
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
  const navigate = useNavigate();
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
  const [rentalSortColumn, setRentalSortColumn] = useState<'startDate' | 'endDate' | null>(null);
  const [rentalSortOrder, setRentalSortOrder] = useState<'asc' | 'desc'>('asc');
  const [plotterSortColumn, setPlotterSortColumn] = useState<'pickupDate' | null>(null);
  const [plotterSortOrder, setPlotterSortOrder] = useState<'asc' | 'desc'>('asc');

  const PAGE_SIZE = 20;
  const [rentalPage, setRentalPage] = useState(1);
  const [plotterPage, setPlotterPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [checkedRentalItems, setCheckedRentalItems] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<"reserved" | "renting" | "returned" | "defective" | "canceled">("renting");
  const [isBulkLoading, setIsBulkLoading] = useState(false);

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

      // Rental[]을 RentalData[]로 변환
      const mappedRentals = (response.rentals || []).map((rental) => ({
        ...rental,
        itemSummary: rental.rentalItems?.length
          ? rental.rentalItems
              .map((ri) => ri.item?.name)
              .filter(Boolean)
              .join(", ")
          : undefined,
        quantity:
          rental.rentalItems?.reduce(
            (sum, ri) => sum + (ri.quantity || 0),
            0,
          ) ?? 0,
      })) as RentalData[];

      setRentalData(mappedRentals);
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

  const handleBulkApply = async () => {
    if (checkedRentalItems.size === 0) return;

    const apiStatus = (
      Object.keys(RENTAL_STATUS_MAP_REVERSE) as Array<keyof typeof RENTAL_STATUS_MAP_REVERSE>
    ).find((k) => RENTAL_STATUS_MAP_REVERSE[k] === bulkStatus) || "RESERVED";

    // 체크된 아이템을 대여별로 그룹화
    const requestsByRental: { rentalId: number; rentalItemId: number }[] = [];
    for (const rental of rentalData) {
      for (const ri of rental.rentalItems || []) {
        if (ri.id !== undefined && checkedRentalItems.has(ri.id)) {
          requestsByRental.push({ rentalId: rental.id, rentalItemId: ri.id });
        }
      }
    }

    try {
      setIsBulkLoading(true);
      // 순차 처리 — 동시 요청 시 DB 트랜잭션 충돌 방지
      for (const { rentalId, rentalItemId } of requestsByRental) {
        await axiosInstance.put(`/api/rentals/${rentalId}/status`, {
          status: apiStatus,
          rentalItemId,
        });
      }
      // 전체 재조회 없이 로컬 상태만 업데이트
      setRentalData((prev) =>
        prev.map((r) => ({
          ...r,
          rentalItems: r.rentalItems.map((ri) =>
            ri.id !== undefined && checkedRentalItems.has(ri.id)
              ? { ...ri, status: apiStatus as typeof ri.status }
              : ri
          ),
        }))
      );
      setCheckedRentalItems(new Set());
      alert("상태가 변경되었습니다.");
    } catch (err: any) {
      alert(err.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const fetchPlotterOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Admin] 플로터 목록 조회 시작");

      // 메타데이터 가져오기 (무료 목적 정보)
      const metadata = await getCommonMetadata();

      const response = await getPlotterOrders({
        page: 1,
        pageSize: 1000,
      });
      console.log("[Admin] 플로터 목록 조회 성공:", response);

      // isPaidService 계산: freePurposes에 있으면 무료(false), 없으면 유료(true)
      const ordersWithPricing = (response.orders || []).map((order) => ({
        ...order,
        isPaidService: !metadata.plotterFreePurposes.includes(order.purpose),
      }));

      setPlotterData(ordersWithPricing);
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

  // handleRentalStatusChange, handleRentalNoteChange는 onSave로 통합되어 더 이상 사용되지 않으므로 제거

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
    memo: string,
  ) => {
    try {
      await axiosInstance.put(`/api/plotter/orders/${orderId}/status`, {
        status: currentStatus,
        memo,
      });
      fetchPlotterOrders();
    } catch (err: any) {
      console.error("비고 저장 실패:", err);
      alert(err.response?.data?.message || "비고 저장에 실패했습니다.");
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

  const handleItemEdit = async (_itemId: number) => {};

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

  const handleRentalColumnSort = (sortKey: string) => {
    if (rentalSortColumn === sortKey) {
      // 같은 컬럼이면 순서 토글
      setRentalSortOrder(rentalSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 컬럼이면 desc (기본값)로 정렬
      setRentalSortColumn(sortKey as 'startDate' | 'endDate');
      setRentalSortOrder('desc');
    }
  };

  const handlePlotterColumnSort = (sortKey: string) => {
    if (plotterSortColumn === sortKey) {
      // 같은 컬럼이면 순서 토글
      setPlotterSortOrder(plotterSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 컬럼이면 desc (기본값)로 정렬
      setPlotterSortColumn(sortKey as 'pickupDate');
      setPlotterSortOrder('desc');
    }
  };

  const filteredRentalData = rentalData.map((item) => {
    // 상태 필터링
    let statusMatch = true;
    if (rentalStatusFilter !== "전체 보기") {
      if (rentalStatusFilter === "불량 반납") {
        statusMatch = item.status === "DEFECTIVE" || item.status === "OVERDUE";
      } else if (rentalStatusFilter === "금일 대여") {
        const today = new Date().toLocaleDateString("en-CA");
        const itemStart = item.startDate.slice(0, 10);
        statusMatch = itemStart === today && item.status !== "CANCELED";
      } else if (rentalStatusFilter === "금일 반납") {
        const today = new Date().toLocaleDateString("en-CA");
        const itemEnd = item.endDate.slice(0, 10);
        statusMatch = itemEnd === today && item.status !== "CANCELED";
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
    if (!rentalSearchQuery.trim()) {
      return statusMatch && dateMatch ? item : null;
    }
    const query = rentalSearchQuery.replace(/\s+/g, "").toLowerCase();
    const norm = (s: string | null | undefined) =>
      (s ?? "").replace(/\s+/g, "").toLowerCase();
    const departmentName = item.departmentName || item.departmentType || "";
    // 이름, 학과, 품목명(대여 품목) 모두에서 검색
    const rentalItemNames = item.rentalItems.map((ri) => norm(ri.item?.name)).join(",");
    const searchMatch =
      norm(item.user?.name).includes(query) ||
      (item.user?.studentId || "").includes(query) ||
      norm(departmentName).includes(query) ||
      rentalItemNames.includes(query) ||
      norm(item.itemSummary).includes(query) ||
      norm(`RENT-${item.id}`).includes(query);

    if (statusMatch && dateMatch && searchMatch) {
      // rentalItems도 검색어에 맞게 필터링
      const filteredRentalItems = item.rentalItems.filter((ri) =>
        norm(ri.item?.name).includes(query) ||
        norm(item.user?.name).includes(query) ||
        norm(departmentName).includes(query)
      );
      return {
        ...item,
        rentalItems: filteredRentalItems,
        itemSummary: filteredRentalItems
          .map((ri) => ri.item?.name)
          .filter(Boolean)
          .join(", "),
      };
    }
    return null;
  }).filter((item): item is RentalData => item !== null);

  // 대여 데이터 정렬
  if (rentalSortColumn) {
    filteredRentalData.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      if (rentalSortColumn === 'startDate') {
        aValue = a.startDate.slice(0, 10);
        bValue = b.startDate.slice(0, 10);
      } else if (rentalSortColumn === 'endDate') {
        aValue = a.endDate.slice(0, 10);
        bValue = b.endDate.slice(0, 10);
      }
      
      const comparison = aValue.localeCompare(bValue);
      return rentalSortOrder === 'asc' ? comparison : -comparison;
    });
  }

  const filteredPlotterData = plotterData.filter((item) => {
    // 상태 필터링
    let statusMatch = true;
    if (plotterStatusFilter !== "전체 상태") {
      if (plotterStatusFilter === "금일 수령") {
        const today = new Date().toLocaleDateString("en-CA");
        const itemPickupDate = item.pickupDate.slice(0, 10);
        statusMatch = itemPickupDate === today && item.status !== "REJECTED";
      } else {
        statusMatch = item.status === PLOTTER_STATUS_MAP[plotterStatusFilter];
      }
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
    const searchMatch = norm(item.name).includes(query);
    return categoryMatch && searchMatch;
  });

  // 플로터 데이터 정렬
  if (plotterSortColumn) {
    filteredPlotterData.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      if (plotterSortColumn === 'pickupDate') {
        aValue = a.pickupDate.slice(0, 10);
        bValue = b.pickupDate.slice(0, 10);
      }
      
      const comparison = aValue.localeCompare(bValue);
      return plotterSortOrder === 'asc' ? comparison : -comparison;
    });
  }

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
            onAddItem={() => setCreateOpen(true)}
          />

          <AdminItemCreateModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSuccess={fetchItems}
          />

          <AdminUserSelectModal
            isOpen={userSelectOpen}
            onClose={() => setUserSelectOpen(false)}
            onSelectUser={(user) => {
              navigate("/rental", {
                state: {
                  adminCreateFor: {
                    userId: user.id,
                    userName: user.name,
                    studentId: user.studentId,
                    departmentType: user.departmentType,
                    departmentName: user.departmentName,
                  },
                },
              });
            }}
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
                    "금일 대여",
                    "금일 반납",
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
                <div className="overflow-x-auto mt-4 md:mt-6">
                  {/* 일괄 처리 액션 바 */}
                  {checkedRentalItems.size > 0 && (
                    <div className="flex items-center gap-3 bg-[#EDEDED] text-black border border-[#C2C2C2] px-4 py-2 rounded-[8px] mb-2 flex-wrap">
                      <span className="text-[14px] font-semibold">{checkedRentalItems.size}개 선택됨</span>
                      <div className="flex-1" />
                      <span className="text-[13px] whitespace-nowrap">상태 변경:</span>
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value as typeof bulkStatus)}
                        disabled={isBulkLoading}
                        className="h-[30px] px-2 rounded-[6px] text-black text-[13px] border border-[#C2C2C2] bg-white outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="reserved">예약</option>
                        <option value="renting">대여중</option>
                        <option value="returned">정상 반납</option>
                        <option value="defective">불량 반납</option>
                        <option value="canceled">예약 취소</option>
                      </select>
                      <button
                        onClick={handleBulkApply}
                        disabled={isBulkLoading}
                        className="h-[30px] px-4 bg-[#f72] rounded-[6px] text-white text-[13px] font-semibold hover:bg-[#e65a3d] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isBulkLoading ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            처리 중...
                          </>
                        ) : "일괄 적용"}
                      </button>
                      <button
                        onClick={() => setCheckedRentalItems(new Set())}
                        disabled={isBulkLoading}
                        className="h-[30px] px-3 bg-white border border-[#C2C2C2] rounded-[6px] text-black text-[13px] hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        선택 해제
                      </button>
                    </div>
                  )}
                  <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible md:min-w-[680px]">
                    {/* 테이블 헤더 */}
                    <AdminTableHeader
                      columns={[
                        { label: "", width: "w-[3%] min-w-0" },
                        { label: "신청번호", width: "w-[7%] min-w-0" },
                        { label: "신청자", width: "w-[8%] min-w-0" },
                        { label: "소속", width: "w-[12%] min-w-0" },
                        { label: "대여 품목 (수량)", width: "flex-1 min-w-0" },
                        { label: "기간", width: "w-[14%] min-w-0", icon: sortIcon, sortKey: "startDate" },
                        { label: "상태", width: "w-[9%] min-w-0" },
                        { label: "수정", width: "w-[5%] min-w-0" },
                      ]}
                      onColumnSort={handleRentalColumnSort}
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
                          paginatedRentalData.flatMap((rental) =>
                            (rental.rentalItems || []).map((item, idx) => (
                              <AdminRentalRow
                                key={rental.id + '-' + (item.id ?? idx)}
                                rentalId={rental.id}
                                rentalItemId={item.id}
                                rentalCode={`R-${rental.id}`}
                                userName={rental.user.name}
                                phoneNumber={rental.user.phoneNumber || "-"}
                                department={
                                  rental.departmentName ||
                                  rental.departmentType ||
                                  "-"
                                }
                                itemName={item.item?.name || "-"}
                                quantity={item.quantity}
                                startDate={rental.startDate}
                                endDate={rental.endDate}
                                note={idx === 0 ? rental.memo || "" : ""}
                                status={
                                  RENTAL_STATUS_MAP_REVERSE[item.status as keyof typeof RENTAL_STATUS_MAP_REVERSE] as
                                    | "reserved"
                                    | "renting"
                                    | "returned"
                                    | "overdue"
                                    | "canceled"
                                    | "defective"
                                    ?? "reserved"
                                }
                                checked={item.id !== undefined && checkedRentalItems.has(item.id)}
                                onCheck={(checked) => {
                                  if (item.id === undefined) return;
                                  setCheckedRentalItems((prev) => {
                                    const next = new Set(prev);
                                    if (checked) next.add(item.id!);
                                    else next.delete(item.id!);
                                    return next;
                                  });
                                }}
                                onSelectGroup={() => {
                                  const groupIds = (rental.rentalItems || [])
                                    .map((ri) => ri.id)
                                    .filter((id): id is number => id !== undefined);
                                  const allChecked = groupIds.every((id) => checkedRentalItems.has(id));
                                  setCheckedRentalItems((prev) => {
                                    const next = new Set(prev);
                                    if (allChecked) groupIds.forEach((id) => next.delete(id));
                                    else groupIds.forEach((id) => next.add(id));
                                    return next;
                                  });
                                }}
                                onSave={({ status: newStatus, memo: newMemo, rentalItemId: itemId }) => {
                                  const apiStatus = (
                                    Object.keys(RENTAL_STATUS_MAP_REVERSE) as Array<keyof typeof RENTAL_STATUS_MAP_REVERSE>
                                  ).find(
                                    (k) => RENTAL_STATUS_MAP_REVERSE[k] === newStatus
                                  ) || "RESERVED";
                                  // 불량 반납은 해당 아이템만, 나머지는 대여 전체 변경
                                  const body: any = { status: apiStatus, memo: newMemo };
                                  if (apiStatus === "DEFECTIVE") body.rentalItemId = itemId;
                                  return axiosInstance.put(`/api/rentals/${rental.id}/status`, body)
                                    .then(() => {
                                      alert("상태가 변경되었습니다.");
                                      // 전체 재조회 없이 로컬 상태만 업데이트
                                      setRentalData((prev) =>
                                        prev.map((r) => {
                                          if (r.id !== rental.id) return r;
                                          return {
                                            ...r,
                                            memo: newMemo ?? r.memo,
                                            rentalItems: r.rentalItems.map((ri) => {
                                              // DEFECTIVE는 해당 아이템만, 나머지는 전체 적용
                                              if (apiStatus === "DEFECTIVE" && ri.id !== itemId) return ri;
                                              return { ...ri, status: apiStatus as typeof ri.status };
                                            }),
                                          };
                                        })
                                      );
                                    })
                                    .catch((err) => {
                                      alert(err.response?.data?.message || "저장에 실패했습니다.");
                                      throw err;
                                    });
                                }}
                              />
                            ))
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* overflow-x-auto */}
                {!loading && !error && filteredRentalData.length > 0 && (
                  <div>
                    <div className="mt-6 md:mt-8">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => navigate("/rental")}
                          className="h-[36px] px-4 bg-[#fe6949] text-white font-medium text-sm rounded-lg hover:bg-[#e65a3d] transition whitespace-nowrap"
                        >
                          신규 예약 추가
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <Pagination
                          total={filteredRentalData.length}
                          page={rentalPage}
                          pageSize={PAGE_SIZE}
                          onPageChange={setRentalPage}
                        />
                      </div>
                    </div>
                  </div>
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
                    "금일 수령",
                    "예약 대기",
                    "예약 확정",
                    "인쇄 완료",
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
                <div className="overflow-x-auto mt-4 md:mt-6">
                  <div className="bg-white border border-[#D9D9D9] rounded-[10px] overflow-visible md:min-w-[680px]">
                    {/* 테이블 헤더 */}
                    <AdminTableHeader
                      columns={[
                        { label: "신청번호", width: "w-[7%] min-w-0" },
                        { label: "신청자", width: "w-[8%] min-w-0" },
                        { label: "소속", width: "w-[12%] min-w-0" },
                        { label: "목적", width: "flex-1 min-w-0" },
                        { label: "용지/장수", width: "w-[10%] min-w-0" },
                        { label: "수령일", width: "w-[10%] min-w-0", icon: sortIcon, sortKey: "pickupDate" },
                        { label: "상태", width: "w-[9%] min-w-0" },
                        { label: "비고", width: "w-[13%] min-w-0" },
                      ]}
                      onColumnSort={handlePlotterColumnSort}
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
                                phoneNumber={plotter.user?.phoneNumber || "-"}
                                club={
                                  plotter.departmentName ||
                                  plotter.departmentType ||
                                  "-"
                                }
                                purpose={plotter.purpose}
                                paperSizeAndCount={`${plotter.paperSize} / ${plotter.orderQuantity || plotter.pageCount}부`}
                                orderDate={plotter.pickupDate}
                                note={plotter.memo || ""}
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
                                fileUrl={plotter.fileUrl}
                                isPaidService={plotter.isPaidService}
                                paymentReceiptImageUrl={
                                  plotter.paymentReceiptUrl
                                }
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
                                onNoteChange={(note) => {
                                  handlePlotterNoteChange(
                                    plotter.id,
                                    plotter.status,
                                    note,
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
                {/* overflow-x-auto */}
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
                        onEditSuccess={fetchItems}
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
    </>
  );
}

export default AdminDashboard;
