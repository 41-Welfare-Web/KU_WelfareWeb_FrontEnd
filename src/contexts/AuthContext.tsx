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
  logout: () => void;
  refreshFromStorage: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  me: "me",
};

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
  const isLoggedIn = !!accessToken;
  return { isLoggedIn, user, accessToken, refreshToken };
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
    refreshFromStorage();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.me);
    refreshFromStorage();
  };

  // 다른 탭에서 로그인/로그아웃 했을 때도 동기화
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
