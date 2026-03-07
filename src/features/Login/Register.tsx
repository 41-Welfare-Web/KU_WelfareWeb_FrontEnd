import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Login/Header";
import { useMetadata } from "../../contexts/MetadataContext";
import {
  requestSignupVerification,
  verifySignupCodeApi,
  registerApi,
} from "../../api/signup/signupApi";
import DepartmentPickerModal from "../../components/DepartmentPickerModal";

export default function Register() {
  const navigate = useNavigate();
  const { deptGroups, loading: metaLoading, refresh } = useMetadata();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const usernameRegex = /^[a-z0-9]{5,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  const [, setDeptSub] = useState<string>("");
  const [, setDeptSubMode] = useState<"select" | "input">("select");
  const [, setDepartmentNameInput] = useState("");

  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [, setServerIssuedCode] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const lastVerifyKeyRef = useRef<string>("");

  // 소속 단위 선택
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [departmentType, setDepartmentType] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const deptDisplay = useMemo(() => {
    if (!departmentType && !departmentName) return "";
    if (departmentType && departmentName)
      return `${departmentType} / ${departmentName}`;
    return departmentType || departmentName;
  }, [departmentType, departmentName]);

  useEffect(() => {
    if (!metaLoading && deptGroups.length === 0) void refresh();
  }, [metaLoading, deptGroups.length]);

  const selectedGroup = useMemo(() => {
    if (!departmentType) return null;
    return (
      deptGroups.find(
        (g: any) => (g.type ?? g.name ?? "") === departmentType,
      ) ?? null
    );
  }, [departmentType, deptGroups]);

  const subOptions = useMemo(() => {
    const raw =
      (selectedGroup as any)?.names ?? (selectedGroup as any)?.items ?? [];
    return Array.isArray(raw) ? (raw as string[]).filter(Boolean) : [];
  }, [selectedGroup]);

  useEffect(() => {
    setDeptSub("");
    setDepartmentNameInput("");

    if (subOptions.length > 0) setDeptSubMode("select");
    else setDeptSubMode("input");
  }, [departmentType, subOptions.length]);

  useEffect(() => {
    setIsVerified(false);
  }, [phone]);

  useEffect(() => {
    const code = verificationCode.trim();
    const pn = normalizePhone(phone.trim());
    if (code.length !== 6) return;
    if (!pn) return;

    const key = `${pn}:${code}`;
    if (lastVerifyKeyRef.current === key) return;
    lastVerifyKeyRef.current = key;

    void verifySignupCode(pn, code);
  }, [verificationCode, phone]);

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

      await requestSignupVerification({ phoneNumber });
    } catch (e: any) {
      setErrorMsg(
        e?.message ?? "인증번호 발송에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySignupCode = async (phoneNumber: string, code: string) => {
    setErrorMsg("");
    try {
      setVerifying(true);

      const data = await verifySignupCodeApi({
        phoneNumber,
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

    if (!username.trim()) {
      return setErrorMsg("아이디를 입력해 주세요.");
    }
    if (!usernameRegex.test(username.trim())) {
      return setErrorMsg(
        "아이디는 5~20자 영문 소문자, 숫자만 사용할 수 있습니다.",
      );
    }
    if (!password.trim()) {
      return setErrorMsg("비밀번호를 입력해 주세요.");
    }
    if (!passwordRegex.test(password)) {
      return setErrorMsg(
        "비밀번호는 영어, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다.",
      );
    }
    if (!name.trim()) return setErrorMsg("이름을 입력해 주세요.");
    if (!studentNo.trim()) return setErrorMsg("학번을 입력해 주세요.");

    if (!departmentType) return setErrorMsg("소속 단위를 선택해 주세요.");
    if (!departmentName) return setErrorMsg("소속을 입력/선택해 주세요.");

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
        departmentType,
        departmentName,
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

  function formatPhoneNumber(value: string) {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
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
              {/* 아이디 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  아이디
                </label>
                <input
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUsername(value);

                    if (!value) {
                      setUsernameError("");
                    } else if (!usernameRegex.test(value)) {
                      setUsernameError(
                        "5~20자 영문 소문자, 숫자만 입력할 수 있습니다.",
                      );
                    } else {
                      setUsernameError("");
                    }
                  }}
                  type="text"
                  placeholder="5~20자 영문 소문자, 숫자"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>
              {usernameError && (
                <p className="text-[13px] text-red-500">{usernameError}</p>
              )}

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
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);

                    if (!passwordRegex.test(value)) {
                      setPasswordError(
                        "영문, 숫자, 특수문자 포함하여 8자 이상 입력해야합니다.",
                      );
                    } else {
                      setPasswordError("");
                    }
                  }}
                  type="password"
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>
              {passwordError && (
                <p className="text-[13px] text-red-500">{passwordError}</p>
              )}

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

              {/* 소속 단위(대분류) */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  소속
                </label>

                <button
                  type="button"
                  onClick={() => setDeptModalOpen(true)}
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-left text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                >
                  <span
                    className={deptDisplay ? "text-black" : "text-black/40"}
                  >
                    {deptDisplay || "소속을 선택해 주세요"}
                  </span>
                </button>

                {/* 선택값이 있으면 힌트 */}
                {(departmentType || departmentName) && (
                  <p className="text-[13px] text-[#868686]">
                    선택됨: {deptDisplay}
                  </p>
                )}

                <DepartmentPickerModal
                  open={deptModalOpen}
                  onClose={() => setDeptModalOpen(false)}
                  value={{ departmentType, departmentName }}
                  onConfirm={({ departmentType, departmentName }) => {
                    setDepartmentType(departmentType);
                    setDepartmentName(departmentName);
                  }}
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
