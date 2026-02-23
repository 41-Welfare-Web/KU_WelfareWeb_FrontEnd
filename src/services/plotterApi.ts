const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export interface PlotterOrderRequest {
  purpose: string;
  paperSize: string;
  pageCount: number;
  department: string;
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
  formData.append("department", data.department);
  formData.append("pdfFile", data.pdfFile);
  
  if (data.paymentReceiptImage) {
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

/**
 * 테스트용 더미 플로터 주문 데이터 생성
 * 여러 개의 샘플 주문을 생성합니다.
 */
export async function createDummyPlotterOrders(count: number = 5): Promise<PlotterOrderResponse[]> {
  const purposes = ['동아리 홍보 포스터', '학과 행사 배너', '학술제 전시물', '프로젝트 발표 자료', '졸업 작품 전시'];
  const paperSizes = ['A0', 'A1', 'A2', 'A3'];
  const departments = ['컴퓨터공학과', '전자공학과', '기계공학과', '건축학과', '경영학과'];
  const results: PlotterOrderResponse[] = [];

  // 더미 PDF 파일 생성 (빈 Blob)
  const createDummyPDF = (name: string): File => {
    const blob = new Blob(['%PDF-1.4 dummy content'], { type: 'application/pdf' });
    return new File([blob], `${name}.pdf`, { type: 'application/pdf' });
  };

  // 더미 결제 영수증 이미지 생성 (빈 Blob)
  const createDummyImage = (): File => {
    const blob = new Blob(['dummy image'], { type: 'image/jpeg' });
    return new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
  };

  for (let i = 0; i < count; i++) {
    const needsReceipt = Math.random() > 0.5;
    const purpose = purposes[i % purposes.length];
    const paperSize = paperSizes[Math.floor(Math.random() * paperSizes.length)];
    const pageCount = Math.floor(Math.random() * 5) + 1;
    const department = departments[Math.floor(Math.random() * departments.length)];

    const orderData: PlotterOrderRequest = {
      purpose,
      paperSize,
      pageCount,
      department,
      pdfFile: createDummyPDF(`sample_${i + 1}`),
      ...(needsReceipt && { paymentReceiptImage: createDummyImage() })
    };

    try {
      const result = await createPlotterOrder(orderData);
      results.push(result);
      console.log(`✅ 더미 주문 ${i + 1}/${count} 생성 완료:`, result.id);
    } catch (error) {
      console.error(`❌ 더미 주문 ${i + 1}/${count} 생성 실패:`, error);
    }

    // API 과부하 방지를 위한 짧은 딜레이
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
