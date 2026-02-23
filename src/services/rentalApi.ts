const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export interface RentalItem {
  id: number;
  user: {
    name: string;
    studentId: string;
  };
  startDate: string;
  endDate: string;
  status: "RESERVED" | "RENTED" | "RETURNED" | "OVERDUE" | "CANCELED";
  itemSummary: string;
  createdAt: string;
}

export interface RentalsResponse {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  rentals: RentalItem[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * 대여 목록 조회
 * GET /api/rentals
 */
export async function getRentals(params?: {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<RentalsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.set("userId", params.userId);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.pageSize) queryParams.set("pageSize", params.pageSize.toString());

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/rentals${queryString ? `?${queryString}` : ""}`;

  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "대여 목록 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 대여 취소
 * DELETE /api/rentals/{rentalId}
 */
export async function cancelRental(rentalId: number): Promise<void> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "대여 취소에 실패했습니다.");
  }
}

/**
 * 대여 예약 생성
 * POST /api/rentals
 */
export interface CreateRentalRequest {
  startDate: string;
  endDate: string;
  items: Array<{
    itemId: number;
    quantity: number;
  }>;
}

export interface CreateRentalResponse {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  rentalItems: Array<{
    itemId: number;
    name: string;
    quantity: number;
  }>;
}

export async function createRental(data: CreateRentalRequest): Promise<CreateRentalResponse> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/rentals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "대여 예약 생성에 실패했습니다.");
  }

  return response.json();
}

/**
 * 테스트용 더미 대여 예약 데이터 생성
 * 여러 개의 샘플 예약을 생성합니다.
 */
export async function createDummyRentals(count: number = 5): Promise<CreateRentalResponse[]> {
  const results: CreateRentalResponse[] = [];

  for (let i = 0; i < count; i++) {
    // 랜덤 대여 기간 (오늘 기준 1~7일 후 시작, 1~3일간 대여)
    const today = new Date();
    const startDaysOffset = Math.floor(Math.random() * 7) + 1;
    const rentalDays = Math.floor(Math.random() * 3) + 1;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startDaysOffset);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + rentalDays);

    // 랜덤 물품 선택 (1~3개 물품, itemId 1~10, 수량 1~3)
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    const usedItemIds = new Set<number>();

    for (let j = 0; j < itemCount; j++) {
      let itemId;
      do {
        itemId = Math.floor(Math.random() * 10) + 1;
      } while (usedItemIds.has(itemId));
      
      usedItemIds.add(itemId);
      items.push({
        itemId,
        quantity: Math.floor(Math.random() * 3) + 1
      });
    }

    const rentalData: CreateRentalRequest = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      items
    };

    try {
      const result = await createRental(rentalData);
      results.push(result);
      console.log(`✅ 더미 대여 ${i + 1}/${count} 생성 완료:`, result.id);
    } catch (error) {
      console.error(`❌ 더미 대여 ${i + 1}/${count} 생성 실패:`, error);
    }

    // API 과부하 방지를 위한 짧은 딜레이
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
