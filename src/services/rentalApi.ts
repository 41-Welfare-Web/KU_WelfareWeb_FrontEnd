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
