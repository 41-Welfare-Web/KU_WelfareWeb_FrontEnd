const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export interface PlotterPurpose {
  id: number;
  name: string;
}

export interface PaperSize {
  id: number;
  name: string;
  price: number;
}

export interface CommonMetadata {
  departments: string[][];
  plotterPurposes: PlotterPurpose[];
  plotterPaperSizes?: PaperSize[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * 공통 메타데이터 조회
 * GET /api/common/metadata
 * 소속 단위 리스트, 플로터 목적 리스트, 용지 크기별 가격 등
 */
export async function getCommonMetadata(): Promise<CommonMetadata> {
  const response = await fetch(`${API_BASE_URL}/api/common/metadata`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "메타데이터 조회에 실패했습니다.");
  }

  return response.json();
}
