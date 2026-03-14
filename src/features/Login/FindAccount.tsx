import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Login/Header";
import FindAccountTabs from "../../components/Login/FindAccountTabs";
import {
  findUsername,
  requestPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "../../api/findAccount/findAccountApi";

type TabKey = "findId" | "resetPw";

export default function FindAccount() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("findId");
  const [finding, setFinding] = useState(false);
  const [findMsg, setFindMsg] = useState<string | null>(null);

  // 아이디 찾기 폼
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // 비밀번호 초기화 폼
  const [username, setUsername] = useState("");
  const [pwPhone, setPwPhone] = useState("");
  const [code, setCode] = useState("");

  // 리프레쉬 토큰
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [resetRequested, setResetRequested] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwOk, setPwOk] = useState(false);

  // 전송/인증
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const primaryBtnText = useMemo(() => {
    return tab === "findId" ? "아이디 찾기" : "비밀번호 초기화";
  }, [tab]);

  // 아이디 찾기 / 비밀번호 초기화
  const onPrimary = async () => {
    if (tab === "findId") {
      if (!name.trim()) {
        alert("이름을 입력해주세요.");
        return;
      }
      if (!phone.trim()) {
        alert("전화번호를 입력해주세요.");
        return;
      }

      try {
        setFinding(true);
        setFindMsg(null);

        const data = await findUsername({
          name: name.trim(),
          phoneNumber: phone.replace(/\D/g, ""),
        });

        setFindMsg(data.message);
      } catch (err: any) {
        setFindMsg(err.message);
      } finally {
        setFinding(false);
      }

      return;
    }

    if (!resetRequested || !resetToken) {
      alert("먼저 인증을 완료해주세요.");
      return;
    }

    if (!pwOk) {
      alert("비밀번호 확인을 먼저 해주세요.");
      return;
    }

    try {
      setFinding(true);

      await confirmPasswordReset({
        resetToken,
        newPassword: newPw,
      });

      alert("비밀번호가 변경되었습니다. 로그인 해주세요.");
      navigate("/login");
    } catch (e: any) {
      alert(e?.message ?? "비밀번호 변경에 실패했어요.");
    } finally {
      setFinding(false);
    }
  };

  // 인증번호 발송
  const onSend = async () => {
    if (!username.trim()) return alert("아이디를 입력해주세요.");
    if (!pwPhone.trim()) return alert("전화번호를 입력해주세요.");

    try {
      setFinding(true);

      await requestPasswordReset({
        username: username.trim(),
        phoneNumber: pwPhone.replace(/\D/g, ""),
      });

      setSent(true);
      setVerified(false);
      setResetRequested(false);
      setResetToken(null);
      setTimeLeft(300);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        alert("아이디와 전화번호 정보가 일치하지 않습니다.");
      } else {
        alert(e?.message ?? "요청에 실패했어요.");
      }
    } finally {
      setFinding(false);
    }
  };

  // 인증번호 검증
  const onVerify = async () => {
    if (!sent) return;
    if (!code.trim()) return alert("인증번호를 입력해주세요.");

    try {
      setFinding(true);

      const { resetToken } = await verifyPasswordResetCode({
        username: username.trim(),
        verificationCode: code.trim(),
      });

      setResetToken(resetToken);
      setVerified(true);
      setResetRequested(true);
      setTimeLeft(0);
      alert("인증이 완료되었어요. 새 비밀번호를 설정해주세요.");
    } catch (e: any) {
      setVerified(false);
      setResetRequested(false);
      setResetToken(null);
      alert(e?.message ?? "인증에 실패했어요.");
    } finally {
      setFinding(false);
    }
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

  // 인증코드 남은 시간
  function formatTimeLeft(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const onChangeTab = (next: TabKey) => {
    setTab(next);

    // 초기화
    setFinding(false);
    setFindMsg(null);

    setSent(false);
    setVerified(false);
    setTimeLeft(0);

    setResetRequested(false);
    setResetToken(null);

    setNewPw("");
    setNewPw2("");
    setPwOk(false);

    setUsername("");
    setPwPhone("");
    setCode("");
  };

  return (
    <>
      <Header />

      <main className="min-h-[calc(100dvh-80px)] px-4 flex items-center justify-center bg-white overflow-hidden">
        <section className="w-full max-w-[520px] rounded-[18px] border border-[#FF7A57] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <div className="px-5 sm:px-8 py-8 sm:py-10">
            {/* 탭바 */}
            <FindAccountTabs value={tab} onChange={onChangeTab} />

            {/* 폼 */}
            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onPrimary();
              }}
            >
              {tab === "findId" ? (
                // 요청 완료
                findMsg ? (
                  <div className="mt-8 flex flex-col items-center text-center">
                    <p className="mt-14 text-[15px] sm:text-[16px] text-[#191919] font-medium leading-[1.6]">
                      요청이 접수되었습니다. <br />
                      가입된 정보와 일치하는 경우, SMS로 아이디를 발송해
                      드립니다.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="mt-12 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition"
                    >
                      로그인으로 돌아가기
                    </button>
                  </div>
                ) : (
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
                )
              ) : resetRequested ? (
                <>
                  {/* 아이디(고정) */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      아이디
                    </label>
                    <input
                      value={username}
                      disabled
                      className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none opacity-70"
                    />
                  </div>

                  {/* 비밀번호 */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      비밀번호
                    </label>
                    <input
                      value={newPw}
                      onChange={(e) => {
                        setNewPw(e.target.value);
                        setPwOk(false);
                      }}
                      type="password"
                      className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                    />
                  </div>

                  {/* 비밀번호 확인 + 확인 버튼 */}
                  <div className="space-y-2">
                    <label className="block text-[16px] font-semibold text-black">
                      비밀번호 확인
                    </label>
                    <div className="flex gap-3">
                      <input
                        value={newPw2}
                        onChange={(e) => {
                          setNewPw2(e.target.value);
                          setPwOk(false);
                        }}
                        type="password"
                        className="flex-1 h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPw || !newPw2)
                            return alert("비밀번호를 입력해 주세요.");
                          if (newPw !== newPw2) {
                            setPwOk(false);
                            return alert("비밀번호가 일치하지 않아요.");
                          }
                          setPwOk(true);
                        }}
                        className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-[#FD7D5D] text-white text-[16px] font-bold active:scale-[0.99] transition"
                      >
                        확인
                      </button>
                    </div>

                    {pwOk && (
                      <p className="text-[13px] text-[#2F9E44] font-semibold">
                        비밀번호가 일치해요.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* 본인인증 */}
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
                        disabled={finding}
                        className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-[#FD7D5D] text-white text-[16px] font-bold active:scale-[0.99] transition disabled:opacity-60"
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
                      <div className="relative flex-1">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          type="text"
                          inputMode="numeric"
                          placeholder="인증번호"
                          className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 pr-20 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                        />
                        {timeLeft > 0 && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#FD7D5D]">
                            {formatTimeLeft(timeLeft)}
                          </span>
                        )}
                      </div>

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
              {!(tab === "findId" && findMsg) && (
                <button
                  type="submit"
                  disabled={
                    finding ||
                    (tab === "resetPw" && resetRequested && !pwOk) ||
                    (tab === "resetPw" && !resetRequested) // 요청 전엔 submit 막기(발송으로만)
                  }
                  className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition disabled:opacity-60"
                >
                  {finding ? "요청 중..." : primaryBtnText}
                </button>
              )}

              {/* 로그인으로 */}
              {!(tab === "findId" && findMsg) && (
                <div className="pt-2 flex items-center justify-center text-[16px] text-[#868686]">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="hover:text-[#555]"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
