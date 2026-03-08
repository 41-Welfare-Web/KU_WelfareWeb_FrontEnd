import axiosInstance from "../api/axiosInstance";

export interface PlotterOrderRequest {
  purpose: string;
  paperSize: string;
  pageCount: number;
  departmentType: string;
  departmentName?: string;
  pickupDate: string;
  pdfFile: File;
  paymentReceiptImage?: File;
}

export interface PlotterOrderResponse {
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
  createdAt: string;
  fileUrl?: string;
  originalFilename?: string;
}

// POST 응답용 (더 많은 정보 포함)
export interface PlotterOrderDetailResponse extends PlotterOrderResponse {
  userId: string;
  isPaidService: boolean;
  price: number;
  fileUrl: string;
  originalFilename: string;
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
): Promise<PlotterOrderDetailResponse> {
  const formData = new FormData();
  
  formData.append("purpose", data.purpose);
  formData.append("paperSize", data.paperSize);
  formData.append("pageCount", data.pageCount.toString());
  formData.append("departmentType", data.departmentType);
  formData.append("pickupDate", data.pickupDate);
  
  if (data.departmentName) {
    formData.append("departmentName", data.departmentName);
  }
  
  formData.append("pdfFile", data.pdfFile);
  
  if (data.paymentReceiptImage) {
    formData.append("paymentReceiptImage", data.paymentReceiptImage);
  }

  try {
    const response = await axiosInstance.post<PlotterOrderDetailResponse>(
      "/api/plotter/orders",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "플로터 주문 신청에 실패했습니다.");
  }
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
  try {
    const response = await axiosInstance.get<{
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
      };
      orders: PlotterOrderResponse[];
    }>("/api/plotter/orders", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "플로터 주문 목록 조회에 실패했습니다.");
  }
}

/**
 * 플로터 주문 취소
 * DELETE /api/plotter/orders/{orderId}
 */
export async function cancelPlotterOrder(orderId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/api/plotter/orders/${orderId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "플로터 주문 취소에 실패했습니다.");
  }
}
