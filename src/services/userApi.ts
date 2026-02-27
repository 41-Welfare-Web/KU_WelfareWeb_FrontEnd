import axiosInstance from "../api/axiosInstance";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  studentId: string;
  phoneNumber: string;
  departmentType: string;
  departmentName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface UpdateProfileRequest {
  currentPassword: string;
  newPassword?: string;
  phoneNumber?: string;
  departmentType?: string;
  departmentName?: string;
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
  try {
    const res = await axiosInstance.get<UserProfile>("/api/users/me");
    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "사용자 정보를 불러오지 못했습니다.";
    throw new Error(message);
  }
}

/**
 * 내 정보 수정
 * PUT /api/users/me
 */
export async function updateMyProfile(
  data: UpdateProfileRequest,
): Promise<UserProfile> {
  try {
    const response = await axiosInstance.put<UserProfile>("/api/users/me", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "정보 수정에 실패했습니다.");
  }
}

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 */
export async function deleteMyAccount(
  data: DeleteAccountRequest,
): Promise<void> {
  try {
    await axiosInstance.delete("/api/users/me", {
      data,
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "회원 탈퇴에 실패했습니다.");
  }
}
