import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "../../components/Login/Header";
import FindAccountTabs from "../../components/Login/FindAccountTabs";

type TabKey = "findId" | "resetPw";

export default function FindAccount() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("findId");

  // 아이디 찾기 폼
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // 비밀번호 초기화 폼
  const [username, setUsername] = useState("");
  const [pwPhone, setPwPhone] = useState("");
  const [code, setCode] = useState("");

  // UI만: 전송/인증 상태 흉내
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const primaryBtnText = useMemo(() => {
    return tab === "findId" ? "아이디 찾기" : "비밀번호 초기화";
  }, [tab]);

  const onPrimary = () => {
    if (tab === "findId") {
      alert("아이디 찾기 요청 (UI만 구현)");
      return;
    }
    alert("비밀번호 초기화 요청 (UI만 구현)");
  };

  const onSend = () => {
    // UI만
    setSent(true);
    setVerified(false);
    alert("인증번호 발송 (UI만 구현)");
  };

  const onVerify = () => {
    // UI만
    setVerified(true);
    alert("인증 완료 (UI만 구현)");
  };

  // 전화번호 자동 하이픈 함수
  function formatPhoneNumber(value: string) {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11,
    )}`;
  }

  return (
    <>
      <Header />

      <main className="min-h-[calc(100dvh-80px)] px-4 flex items-center justify-center bg-white overflow-hidden">
        <section className="w-full max-w-[520px] rounded-[18px] border border-[#FF7A57] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <div className="px-5 sm:px-8 py-8 sm:py-10">
            {/* 탭바 */}
            <FindAccountTabs value={tab} onChange={setTab} />

            {/* 폼 */}
            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onPrimary();
              }}
            >
              {tab === "findId" ? (
                <>
                  {/* 이름 */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      이름
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                    />
                  </div>

                  {/* 전화번호 */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      전화번호
                    </label>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatPhoneNumber(e.target.value))
                      }
                      type="tel"
                      inputMode="numeric"
                      placeholder="010-1234-5678"
                      className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                    />
                  </div>
                </>
              ) : (
                <>
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

                  {/* 전화번호 + 발송 */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      전화번호
                    </label>
                    <div className="flex gap-3">
                      <input
                        value={pwPhone}
                        onChange={(e) =>
                          setPwPhone(formatPhoneNumber(e.target.value))
                        }
                        type="tel"
                        inputMode="numeric"
                        placeholder="010-1234-5678"
                        className="flex-1 h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                      />
                      <button
                        type="button"
                        onClick={onSend}
                        className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-[#FD7D5D] text-white text-[16px] font-bold active:scale-[0.99] transition"
                      >
                        발송
                      </button>
                    </div>
                    {sent && (
                      <p className="text-[13px] text-[#868686]">
                        인증번호를 발송했어요.
                      </p>
                    )}
                  </div>

                  {/* 인증번호 + 인증 */}
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        type="text"
                        inputMode="numeric"
                        placeholder="인증번호"
                        className="flex-1 h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                      />
                      <button
                        type="button"
                        onClick={onVerify}
                        disabled={!sent}
                        className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-[#FD7D5D] text-white text-[16px] font-bold active:scale-[0.99] transition disabled:opacity-50"
                      >
                        인증
                      </button>
                    </div>

                    {verified && (
                      <p className="text-[13px] text-[#2F9E44] font-semibold">
                        인증이 완료되었어요.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* 메인 버튼 */}
              <button
                type="submit"
                className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition"
              >
                {primaryBtnText}
              </button>

              {/* 로그인으로 */}
              <div className="pt-2 flex items-center justify-center text-[16px] text-[#868686]">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="hover:text-[#555]"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
