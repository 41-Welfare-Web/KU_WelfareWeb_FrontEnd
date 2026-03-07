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

// API 응답 인터페이스 (실제 API 형식)
interface CommonMetadataResponse {
  departments: string[][];
  purposes: string[];
  freePurposes: string[];
  prices: {
    [key: string]: number; // { a0: 5000, a1: 3000 }
  };
}

// 프론트엔드에서 사용하는 형식
export interface CommonMetadata {
  departments: string[][];
  plotterPurposes: PlotterPurpose[];
  plotterPaperSizes: PaperSize[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}

// 용지 크기 표시 형식 매핑
const PAPER_SIZE_LABELS: { [key: string]: string } = {
  a0: "A0(841 x 1189mm)",
  a1: "A1(594 x 841mm)",
  a2: "A2(420 x 594mm)",
  a3: "A3(297 x 420mm)",
};

/**
 * 공통 메타데이터 조회
 * GET /api/common/metadata
 * 소속 단위 리스트, 플로터 목적 리스트, 용지 크기별 가격 등
 */
export async function getCommonMetadata(): Promise<CommonMetadata> {
  try {
    const response = await axiosInstance.get<CommonMetadataResponse>("/api/common/metadata");
    const data = response.data;
    
    // API 응답을 프론트엔드 형식으로 변환
    const plotterPurposes: PlotterPurpose[] = data.purposes?.map((name, index) => ({
      id: index + 1,
      name,
    })) || [];
    
    const plotterPaperSizes: PaperSize[] = Object.entries(data.prices || {}).map(([key, price], index) => ({
      id: index + 1,
      name: PAPER_SIZE_LABELS[key.toLowerCase()] || key.toUpperCase(),
      price,
    }));
    
    return {
      departments: data.departments || [],
      plotterPurposes,
      plotterPaperSizes,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "메타데이터 조회에 실패했습니다.");
  }
}
