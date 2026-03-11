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
