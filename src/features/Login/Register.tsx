import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Login/Header";
import { getDepartments } from "../../api/signup/signupApi";
import {
  requestSignupVerification,
  verifySignupCodeApi,
  registerApi,
} from "../../api/signup/signupApi";

type Unit = { id: number; name: string };

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // 로그인 아이디
  const [studentNo, setStudentNo] = useState(""); // studentId
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 소속 단위 (department)
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");
  const [departmentName, setDepartmentName] = useState("");

  const [phone, setPhone] = useState(""); // phoneNumber
  const [verificationCode, setVerificationCode] = useState("");

  const [, setServerIssuedCode] = useState<string>(""); // 개발 편의: 응답 code 표시용(UI는 안 바꾸려고 화면에 안 뿌림)
  const [isVerified, setIsVerified] = useState(false); //  인증 성공 여부

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 인증 자동검증 중복 방지
  const lastVerifyKeyRef = useRef<string>("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const departments = await getDepartments();
        const mapped: Unit[] = departments.map((name, idx) => ({
          id: idx + 1,
          name,
        }));
        setUnits(mapped);
      } catch (error) {
        console.error("메타데이터 로드 실패:", error);
        // 에러 시 빈 배열 유지
      }
    };

    fetchMetadata();
  }, []);

  const selectedUnitName = useMemo(() => {
    const found = units.find((u) => u.id === unitId);
    return found?.name ?? "";
  }, [unitId, units]);

  // 입력 변경되면 인증 상태 리셋(전화번호/코드 바뀌면 다시 인증해야 함)
  useEffect(() => {
    setIsVerified(false);
  }, [phone]);

  useEffect(() => {
    // 인증번호 6자리 되면 자동 검증 (UI 추가 없이 “연동만”)
    const code = verificationCode.trim();
    const pn = phone.trim();

    if (code.length !== 6) return;
    if (!pn) return;

    const key = `${pn}:${code}`;
    if (lastVerifyKeyRef.current === key) return;
    lastVerifyKeyRef.current = key;

    void verifySignupCode(pn, code);
  }, [verificationCode]);

  const onSendVerification = async () => {
    setErrorMsg("");

    const phoneNumberRaw = phone.trim();
    if (!phoneNumberRaw) {
      setErrorMsg("핸드폰 번호를 입력해 주세요.");
      return;
    }

    const phoneNumber = normalizePhone(phoneNumberRaw);

    try {
      setLoading(true);
      setIsVerified(false);
      setServerIssuedCode("");
      setVerificationCode("");

      const data = await requestSignupVerification({ phoneNumber });

      setServerIssuedCode(data.code || "");
    } catch (e: any) {
      setErrorMsg(
        e?.message ?? "인증번호 발송에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySignupCode = async (phoneNumberRaw: string, code: string) => {
    setErrorMsg("");

    try {
      setVerifying(true);

      const data = await verifySignupCodeApi({
        phoneNumber: normalizePhone(phoneNumberRaw),
        verificationCode: code,
      });

      setIsVerified(Boolean(data.success));
      if (!data.success) setErrorMsg(data.message || "인증에 실패했어요.");
    } catch (e: any) {
      setIsVerified(false);
      setErrorMsg(e?.message ?? "인증 확인 중 오류가 발생했어요.");
    } finally {
      setVerifying(false);
    }
  };

  const onSignUp = async () => {
    setErrorMsg("");

    if (!username.trim()) return setErrorMsg("아이디를 입력해 주세요.");
    if (!password.trim()) return setErrorMsg("비밀번호를 입력해 주세요.");
    if (!name.trim()) return setErrorMsg("이름을 입력해 주세요.");
    if (!studentNo.trim()) return setErrorMsg("학번을 입력해 주세요.");
    if (!unitId) return setErrorMsg("소속 단위를 선택해 주세요.");
    if (!departmentName.trim()) return setErrorMsg("소속을 입력해 주세요.");
    if (!phone.trim()) return setErrorMsg("핸드폰 번호를 입력해 주세요.");
    if (!verificationCode.trim())
      return setErrorMsg("인증번호를 입력해 주세요.");
    if (!isVerified) return setErrorMsg("휴대폰 인증을 완료해 주세요.");

    try {
      setLoading(true);

      const data = await registerApi({
        username: username.trim(),
        password,
        name: name.trim(),
        studentId: studentNo.trim(),
        phoneNumber: normalizePhone(phone.trim()),
        departmentType: selectedUnitName,
        departmentName: departmentName.trim(),
        verificationCode: verificationCode.trim(),
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      navigate("/login");
    } catch (e: any) {
      setErrorMsg(
        e?.message ?? "회원가입에 실패했어요. 입력값을 확인해 주세요.",
      );
    } finally {
      setLoading(false);
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

  function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
  }

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
              {/* 아이디 (API username) - UI는 기존 input 스타일 그대로 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  아이디
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="5~20자 영문 소문자, 숫자"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

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
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
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

                {selectedUnitName && (
                  <p className="text-[13px] text-[#868686]">
                    선택됨: {selectedUnitName}
                  </p>
                )}

                <input
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  type="text"
                  placeholder="소속을 입력해주세요"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {/* 핸드폰 번호 + 인증 버튼 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  핸드폰 번호
                </label>

                <div className="flex gap-3">
                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatPhoneNumber(e.target.value))
                    }
                    type="tel"
                    inputMode="numeric"
                    placeholder="010-1234-5678"
                    className="flex-1 h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                  />
                  <button
                    type="button"
                    onClick={onSendVerification}
                    disabled={loading}
                    className="shrink-0 h-12 sm:h-14 px-5 rounded-[10px] bg-[#FD7D5D] text-white text-[16px] font-bold active:scale-[0.99] transition disabled:opacity-60"
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

              {/* 가입 완료 버튼 (인증 성공 전에는 비활성화) */}
              <button
                type="submit"
                disabled={loading || verifying || !isVerified}
                className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition disabled:opacity-60"
              >
                가입 완료
              </button>

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
