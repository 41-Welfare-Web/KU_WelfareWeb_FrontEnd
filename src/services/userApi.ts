const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  studentId: string;
  phoneNumber: string;
  department: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface UpdateProfileRequest {
  currentPassword: string;
  newPassword?: string;
  phoneNumber?: string;
  department?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * 내 정보 조회
 * GET /api/users/me
 */
export async function getMyProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "사용자 정보를 불러오지 못했습니다.");
  }

  return response.json();
}

/**
 * 내 정보 수정
 * PUT /api/users/me
 */
export async function updateMyProfile(
  data: UpdateProfileRequest
): Promise<UserProfile> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "정보 수정에 실패했습니다.");
  }

  return response.json();
}

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 */
export async function deleteMyAccount(
  data: DeleteAccountRequest
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json() as ApiError;
    throw new Error(error.message || "회원 탈퇴에 실패했습니다.");
  }
}
