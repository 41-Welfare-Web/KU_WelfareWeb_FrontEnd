import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type User = {
  id: string;
  username: string;
  name: string;
  role: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

type LoginPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = AuthState & {
  login: (payload: LoginPayload) => void;
  logout: () => Promise<void>;
  refreshFromStorage: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  me: "me",
};

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

function readUserFromStorage(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.me);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function readAuthFromStorage(): AuthState {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  const user = readUserFromStorage();
  return {
    isLoggedIn: !!accessToken,
    user,
    accessToken,
    refreshToken,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuthFromStorage());

  const refreshFromStorage = () => {
    setState(readAuthFromStorage());
  };

  const login = (payload: LoginPayload) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, payload.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, payload.refreshToken);
    localStorage.setItem(STORAGE_KEYS.me, JSON.stringify(payload.user));

    // 즉시 state 반영 (Header 바로 변경)
    setState({
      isLoggedIn: true,
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });
  };

  // 서버 로그아웃 연동
  const logout = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);

    // 1) UI 먼저 즉시 로그아웃(PC/모바일 모두 즉시 반영)
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.me);

    setState({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });

    // 2) 서버 로그아웃은 “시도만”
    if (!refreshToken) return;

    // refresh를 호출하더라도 "state/localStorage 갱신 금지" (임시 토큰만)
    const getFreshAccessToken = async (): Promise<string | null> => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data?.accessToken ?? data?.result?.accessToken ?? null;
      } catch {
        return null;
      }
    };

    const tryLogout = async (token?: string | null) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      return fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refreshToken }),
      });
    };

    try {
      // 1차 시도 (기존 accessToken으로)
      const res1 = await tryLogout(accessToken);

      // 401이면 refresh 후 재시도
      if (res1.status === 401) {
        const fresh = await getFreshAccessToken();
        await tryLogout(fresh);
      }
    } catch {
      // 서버 실패는 무시 (클라는 이미 로그아웃 완료 상태)
    }
  };

  // 다른 탭에서 로그인/로그아웃 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEYS.accessToken ||
        e.key === STORAGE_KEYS.refreshToken ||
        e.key === STORAGE_KEYS.me
      ) {
        refreshFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshFromStorage,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
