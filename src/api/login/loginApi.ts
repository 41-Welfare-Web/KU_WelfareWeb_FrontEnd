import type { LoginRequest, LoginResponse } from "./types";
import { API_BASE_URL } from "../client";

type ApiErrorBody = {
  message?: string;
  errorCode?: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();

  try {
    const data = (text ? JSON.parse(text) : null) as ApiErrorBody | null;
    return (
      data?.message || data?.errorCode || `로그인 실패 (HTTP ${res.status})`
    );
  } catch {
    return text || `로그인 실패 (HTTP ${res.status})`;
  }
}

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readErrorMessage(res);
    throw new Error(msg);
  }

  return (await res.json()) as LoginResponse;
}
