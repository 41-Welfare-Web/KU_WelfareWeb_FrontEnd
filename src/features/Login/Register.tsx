import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";

type Unit = { id: number; name: string };

export default function Register() {
  const navigate = useNavigate();

  const [studentNo, setStudentNo] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 소속 단위 (서버에서 불러올 예정)
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");

  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 서버 붙이면 여기만 교체
  useEffect(() => {
    // TODO: GET /units 같은 API로 교체
    const mock: Unit[] = [
      { id: 1, name: "학생복지 위원회" },
      { id: 2, name: "총학생회" },
      { id: 3, name: "동아리연합회" },
    ];
    setUnits(mock);
  }, []);

  const selectedUnitName = useMemo(() => {
    const found = units.find((u) => u.id === unitId);
    return found?.name ?? "";
  }, [unitId, units]);

  const onSendVerification = async () => {
    setErrorMsg("");
    if (!phone.trim()) {
      setErrorMsg("핸드폰 번호를 입력해 주세요.");
      return;
    }
    try {
      setLoading(true);
      // TODO: POST /auth/sms 같은 API로 교체
      // await api.sendSms({ phone })
    } catch {
      setErrorMsg("인증번호 발송에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async () => {
    setErrorMsg("");

    if (!studentNo.trim()) return setErrorMsg("학번을 입력해 주세요.");
    if (!password.trim()) return setErrorMsg("비밀번호를 입력해 주세요.");
    if (!name.trim()) return setErrorMsg("이름을 입력해 주세요.");
    if (!unitId) return setErrorMsg("소속 단위를 선택해 주세요.");
    if (!phone.trim()) return setErrorMsg("핸드폰 번호를 입력해 주세요.");
    if (!verificationCode.trim())
      return setErrorMsg("인증번호를 입력해 주세요.");

    try {
      setLoading(true);

      // TODO: POST /signup 같은 API로 교체
      // await api.signUp({
      //   studentNo,
      //   password,
      //   name,
      //   unitId,
      //   phone,
      //   verificationCode,
      // });

      navigate("/login");
    } catch {
      setErrorMsg("회원가입에 실패했어요. 입력값을 확인해 주세요.");
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
              회원가입
            </h1>

            <form
              className="mt-7 sm:mt-9 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSignUp();
              }}
            >
              {/* 학번 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  학번
                </label>
                <input
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  type="text"
                  inputMode="numeric"
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
                  placeholder="영문, 숫자 포함 8자 이상"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

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

              {/* 소속 단위 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  소속 단위
                </label>

                <div className="relative">
                  <select
                    value={unitId}
                    onChange={(e) =>
                      setUnitId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="appearance-none w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 pr-10 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                  >
                    <option value="" disabled>
                      소속 단위를 선택해 주세요
                    </option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  {/* dropdown chevron */}
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 10l5 5 5-5"
                      stroke="#191919"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* 선택된 값 미리보기 (원하면 제거 가능) */}
                {selectedUnitName && (
                  <p className="text-[13px] text-[#868686]">
                    선택됨: {selectedUnitName}
                  </p>
                )}
              </div>

              {/* 핸드폰 번호 + 인증 버튼 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  핸드폰 번호
                </label>

                <div className="flex gap-3">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    inputMode="numeric"
                    placeholder="01012345678"
                    className="flex-1 h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                  />
                  <button
                    type="button"
                    onClick={onSendVerification}
                    disabled={loading}
                    className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-black text-white text-[16px] font-bold active:scale-[0.99] transition disabled:opacity-60"
                  >
                    인증
                  </button>
                </div>
              </div>

              {/* 인증번호 */}
              <div className="space-y-2">
                <input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  placeholder="인증번호"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {errorMsg && (
                <p className="text-[14px] text-red-500 font-medium">
                  {errorMsg}
                </p>
              )}

              {/* 가입 완료 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition disabled:opacity-60"
              >
                가입 완료
              </button>

              {/* 하단 링크 */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[16px] text-[#868686]">
                <button
                  type="button"
                  className="hover:text-[#555]"
                  onClick={() => navigate("/login")}
                >
                  로그인으로
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
