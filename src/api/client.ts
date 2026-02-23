// base url
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export type ApiErrorBody = {
  message?: string;
  errorCode?: string;
};

export async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // 서버가 에러 바디를 주는 경우 메시지 뽑아오기
    try {
      const body = (await res.json()) as ApiErrorBody;
      throw new Error(body?.message || body?.errorCode || "요청 실패");
    } catch {
      throw new Error("요청 실패");
    }
  }
  return (await res.json()) as T;
}

export function buildQuery(
  params: Record<string, string | number | undefined>,
) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
