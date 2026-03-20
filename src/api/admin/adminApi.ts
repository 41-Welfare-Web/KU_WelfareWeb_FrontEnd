import axiosInstance from "../axiosInstance";
import type { CreateItemRequest } from "./types";

// 물품 생성(POST /api/items)
export async function createItem(data: CreateItemRequest) {
  const res = await axiosInstance.post("/api/items", data);
  return res.data;
}

// 이미지 업로드(POST /api/admin/upload-image)
export async function uploadItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/api/admin/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.url;
}

// 물품 상세 조회 (GET /api/items/{itemId})
export async function getItemDetail(itemId: number) {
  const response = await axiosInstance.get(`/api/items/${itemId}`);
  return response.data;
}

// 물품 수정 (PUT /api/items/{itemId})
export async function updateItem(
  itemId: number,
  payload: {
    categoryId?: number;
    name?: string;
    itemCode?: string;
    description?: string;
    imageUrl?: string | null;
    imageUrls?: string[];
    videoUrl?: string | null;
    managementType?: "BULK" | "INDIVIDUAL";
    totalQuantity?: number;
  },
) {
  const response = await axiosInstance.put(`/api/items/${itemId}`, payload);
  return response.data;
}
