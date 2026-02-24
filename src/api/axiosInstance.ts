import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// ===== Request interceptor: accessToken 자동 주입 =====
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Refresh 동시성 잠금 (여러 요청이 동시에 401나도 refresh 1번만) =====
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;

  // 이미 refresh 중이면 그 결과를 기다림
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const nextToken: string | null =
        res.data?.accessToken ?? res.data?.result?.accessToken ?? null;

      if (nextToken) {
        localStorage.setItem(STORAGE_KEYS.accessToken, nextToken);
      }

      return nextToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ===== Response interceptor: 401이면 refresh 후 1회 재시도 =====
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // 네트워크 에러 등 config 없으면 그대로 throw
    if (!original) throw error;

    // 401 + 아직 재시도 안 했을 때만 refresh
    const status = error.response?.status;
    if (status === 401 && !original._retry) {
      original._retry = true;

      const next = await refreshAccessToken();
      if (!next) {
        // refresh 실패면 로그인 만료 처리(여기서는 에러 throw만)
        throw error;
      }

      // 새 토큰으로 헤더 갱신 후 원 요청 재시도
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${next}`;

      return axiosInstance(original);
    }

    throw error;
  },
);

export default axiosInstance;
