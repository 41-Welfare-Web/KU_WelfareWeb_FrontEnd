import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./components/Header";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

type LoginResponse = {
  user: {
    id: string;
    username: string;
    name: string;
    role: "USER" | "ADMIN" | string;
  };
  accessToken: string;
  refreshToken: string;
};

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [username, setUsername] = useState(""); // 학번(로그인 아이디)
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onLogin = async () => {
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("학번과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      // 응답이 JSON일 거라 가정하되, 실패도 대비
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg =
          typeof data === "string"
            ? data
            : (data?.message ?? `로그인 실패 (HTTP ${res.status})`);
        throw new Error(msg);
      }

      const result = data as LoginResponse;

      auth.login({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      navigate("/");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "로그인 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-[calc(100dvh-80px)] px-4 flex items-center justify-center bg-white overflow-hidden">
        <section className="w-full max-w-[520px] rounded-[18px] border border-[#FF7A57] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <div className="px-5 sm:px-8 py-8 sm:py-10">
            <h1 className="text-center text-[28px] sm:text-[32px] font-extrabold text-black">
              로그인
            </h1>

            <form
              className="mt-7 sm:mt-9 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onLogin();
              }}
            >
              {/* 아이디 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  아이디
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  inputMode="text"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  비밀번호
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {errorMsg && (
                <p className="text-[14px] text-red-500 font-medium">
                  {errorMsg}
                </p>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition"
              >
                로그인하기
              </button>

              {/* 하단 링크 */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[16px] text-[#868686]">
                <button type="button" className="hover:text-[#555]">
                  아이디/비밀번호 찾기
                </button>
                <span className="text-[#868686]">|</span>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="hover:text-[#555]"
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
