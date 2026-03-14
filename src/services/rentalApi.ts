import axiosInstance from "../api/axiosInstance";
import type { Rental } from "../api/rental/types";

export interface RentalsResponse {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  rentals: Rental[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * 대여 목록 조회
 * GET /api/rentals
 * API 명세: userId, status, page, pageSize만 지원
 */
export async function getRentals(params?: {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<RentalsResponse> {
  try {
    const response = await axiosInstance.get<RentalsResponse>("/api/rentals", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "대여 목록 조회에 실패했습니다.");
  }
}

/**
 * 대여 취소
 * DELETE /api/rentals/{rentalId}
 */
export async function cancelRental(rentalId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/api/rentals/${rentalId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "대여 취소에 실패했습니다.");
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
  try {
    const response = await axiosInstance.post<CreateRentalResponse>("/api/rentals", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "대여 예약 생성에 실패했습니다.");
  }
}
