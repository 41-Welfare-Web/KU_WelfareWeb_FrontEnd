import axiosInstance from "../api/axiosInstance";

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
  try {
    const response = await axiosInstance.get<CommonMetadata>("/api/common/metadata");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "메타데이터 조회에 실패했습니다.");
  }
}
