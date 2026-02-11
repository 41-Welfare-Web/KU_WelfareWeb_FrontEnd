import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/all/logo.svg";
import my from "../assets/all/my.svg";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);

  const { isLoggedIn, user, logout } = useAuth();

  const closeAll = () => {
    setOpen(false);
    setUserMenuOpen(false);
  };

  const go = (path: string) => {
    closeAll();
    navigate(path);
  };

  const onLogout = async () => {
    await logout();
    closeAll();
    navigate("/");
  };

  const menuClass = (path: string) =>
    `font-semibold text-base transition-colors ${
      location.pathname.startsWith(path)
        ? "text-[#FE6949]"
        : "text-[#410F07] hover:text-[#FE6949]"
    }`;

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopUserMenuRef.current?.contains(target) ?? false;
      const inMobile = mobileUserMenuRef.current?.contains(target) ?? false;
      if (!inDesktop && !inMobile) setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:h-16 sm:px-6 lg:h-20 lg:px-7">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 sm:gap-3"
        >
          <img
            src={logo}
            alt="로고"
            className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
          />
          <div className="flex flex-col items-start leading-tight text-[#410F07]">
            <p className="text-[12px] font-semibold sm:text-xs lg:text-sm">
              건국대학교 41대 학생복지위원회
            </p>
            <p className="text-[16px] font-semibold sm:text-lg lg:text-xl">
              연:連
            </p>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-5 md:flex">
          <button type="button" className={menuClass("/committee")}>
            학생복지위원회
          </button>

          <button
            type="button"
            onClick={() => navigate("/rental")}
            className={menuClass("/rental")}
          >
            중앙대여사업
          </button>

          <button type="button" className={menuClass("/plotter")}>
            플로터인쇄사업
          </button>

          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => go("/login")}
              className={menuClass("/login")}
            >
              로그인
            </button>
          ) : (
            <div ref={desktopUserMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                onMouseEnter={() => setUserMenuOpen(true)}
                className="flex items-center gap-3 rounded-full bg-[#FD8060] px-4 py-2 text-black text-sm hover:opacity-90"
              >
                <img src={my} alt="사용자" />
                {user?.name ?? "사용자"}님
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-[160px] overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {[
                    { label: "마이페이지", path: "/mypage" },
                    { label: "대여 현황", path: "/mypage/rental" },
                    { label: "플로터 현황", path: "/mypage/plotter" },
                    { label: "정보 수정", path: "/mypage/edit" },
                  ].map((item) => (
                    <div key={item.path}>
                      <button
                        type="button"
                        onClick={() => go(item.path)}
                        className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                      >
                        {item.label}
                      </button>
                      <div className="h-px bg-black/10" />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <div ref={mobileUserMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-[#FD8060] px-3 py-2 text-black text-[10px] hover:opacity-90"
                aria-label="사용자 메뉴"
                aria-expanded={userMenuOpen}
              >
                <img src={my} alt="사용자" />
                {user?.name ?? "사용자"}님
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-[160px] overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                  <button
                    type="button"
                    onClick={() => go("/mypage")}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    마이페이지
                  </button>
                  <div className="h-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => go("/mypage/rental")}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    대여 현황
                  </button>
                  <div className="h-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => go("/mypage/plotter")}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    플로터 현황
                  </button>
                  <div className="h-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => go("/mypage/edit")}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    정보 수정
                  </button>
                  <div className="h-px bg-black/10" />
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-left text-[16px] font-semibold text-[#410F07] hover:text-[#FE6949] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-[#410F07]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="메뉴 열기"
          >
            메뉴
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden">
          <div className="px-4 pb-4">
            <div className="flex flex-col gap-2 rounded-xl border bg-white p-3 text-[#410F07]">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
              >
                학생복지위원회
              </button>
              <button
                type="button"
                onClick={() => navigate("/rental")}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
              >
                중앙대여사업
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
              >
                플로터인쇄사업
              </button>
              {!isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
                >
                  로그인
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => go("/mypage")}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
                >
                  마이페이지
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
