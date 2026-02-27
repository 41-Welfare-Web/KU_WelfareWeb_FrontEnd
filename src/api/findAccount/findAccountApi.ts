import { API_BASE_URL } from "../client";

async function safeJsonOrEmpty(res: Response) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// 아이디 찾기
export async function findUsername(body: {
  name: string;
  phoneNumber: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/find-username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await safeJsonOrEmpty(res);
    throw new Error(err?.message ?? "아이디 찾기 요청에 실패했습니다.");
  }

  const data = await safeJsonOrEmpty(res);
  return {
    message:
      data?.message ??
      "요청이 접수되었습니다. 가입된 정보와 일치하는 경우, SMS로 아이디를 발송해 드립니다.",
  };
}

// 비밀번호 초기화 - 본인인증 (POST /api/auth/password-reset/request)
export async function requestPasswordReset(body: {
  username: string;
  phoneNumber: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await safeJsonOrEmpty(res);
    throw new Error(err?.message ?? "비밀번호 재설정 요청에 실패했습니다.");
  }

  const data = await safeJsonOrEmpty(res);
  return {
    message: data?.message ?? "요청이 접수되었습니다.",
  };
}

// 비밀전호 초기화 - 인증번호 검증 (POST /api/auth/password-reset/verify)
export async function verifyPasswordResetCode(body: {
  username: string;
  verificationCode: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await safeJsonOrEmpty(res);
    throw new Error(err?.message ?? "인증 코드 확인에 실패했습니다.");
  }

  const data = await safeJsonOrEmpty(res);

  const resetToken = data?.resetToken;
  if (!resetToken) {
    throw new Error("resetToken을 받지 못했습니다.");
  }

  return { resetToken: String(resetToken) };
}

// 비밀번호 초기화 - 새 비밀번호 요청 (POST /api/auth/password-reset/confirm)
export async function confirmPasswordReset(body: {
  resetToken: string;
  newPassword: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await safeJsonOrEmpty(res);
    throw new Error(err?.message ?? "비밀번호 재설정에 실패했습니다.");
  }

  const data = await safeJsonOrEmpty(res);
  return {
    message: data?.message ?? "비밀번호가 변경되었습니다.",
  };
}
