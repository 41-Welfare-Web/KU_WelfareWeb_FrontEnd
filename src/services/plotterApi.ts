const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export interface PlotterOrderRequest {
  purpose: string;
  paperSize: string;
  pageCount: number;
  isPaidService: boolean;
  pdfFile: File;
  paymentReceiptImage?: File;
}

export interface PlotterOrderResponse {
  id: number;
  userId: string;
  purpose: string;
  paperSize: string;
  pageCount: number;
  isPaidService: boolean;
  price: number;
  fileUrl: string;
  originalFilename: string;
  pickupDate: string;
  status: string;
  createdAt: string;
}

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * 플로터 주문 신청
 * POST /api/plotter/orders
 */
export async function createPlotterOrder(
  data: PlotterOrderRequest
): Promise<PlotterOrderResponse> {
  const formData = new FormData();
  
  formData.append("purpose", data.purpose);
  formData.append("paperSize", data.paperSize);
  formData.append("pageCount", data.pageCount.toString());
  formData.append("isPaidService", data.isPaidService.toString());
  formData.append("pdfFile", data.pdfFile);
  
  if (data.isPaidService && data.paymentReceiptImage) {
    formData.append("paymentReceiptImage", data.paymentReceiptImage);
  }

  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/plotter/orders`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "플로터 주문 신청에 실패했습니다.");
  }

  return response.json();
}

/**
 * 플로터 주문 목록 조회
 * GET /api/plotter/orders
 */
export async function getPlotterOrders(params?: {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  orders: PlotterOrderResponse[];
}> {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.set("userId", params.userId);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.pageSize) queryParams.set("pageSize", params.pageSize.toString());

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/plotter/orders${queryString ? `?${queryString}` : ""}`;

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
    throw new Error(error.message || "플로터 주문 목록 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 플로터 주문 취소
 * DELETE /api/plotter/orders/{orderId}
 */
export async function cancelPlotterOrder(orderId: number): Promise<void> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/plotter/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "플로터 주문 취소에 실패했습니다.");
  }
}
