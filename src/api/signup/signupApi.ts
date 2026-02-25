import type {
  ApiErrorBody,
  RequestSignupVerificationRequest,
  RequestSignupVerificationResponse,
  VerifySignupCodeRequest,
  VerifySignupCodeResponse,
  RegisterRequest,
  RegisterResponse,
  CommonMetadataResponse,
} from "./types";
import { API_BASE_URL } from "../client";

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = (text ? JSON.parse(text) : null) as ApiErrorBody | null;
    return data?.message || data?.errorCode || "요청에 실패했어요.";
  } catch {
    return text || "요청에 실패했어요.";
  }
}

// 인증
export async function requestSignupVerification(
  payload: RequestSignupVerificationRequest,
): Promise<RequestSignupVerificationResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/auth/request-signup-verification`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as RequestSignupVerificationResponse;
}

// 검증
export async function verifySignupCodeApi(
  payload: VerifySignupCodeRequest,
): Promise<VerifySignupCodeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-signup-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as VerifySignupCodeResponse;
}

// 회원가입
export async function registerApi(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as RegisterResponse;
}

// 메타데이터 불러오기 (소속단위 목록)
export async function getDepartments(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/common/metadata`, {
    method: "GET",
    headers: { accept: "*/*" },
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));

  const data = (await res.json()) as CommonMetadataResponse;
  return Array.isArray(data.departments) ? data.departments : [];
}
