import { useState } from "react";
import logo from "../assets/all/logo.svg";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:h-16 sm:px-6 lg:h-20 lg:px-7">
        {/* Left: logo + title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            alt="로고"
            className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
          />
          <div className="flex flex-col leading-tight text-[#410F07]">
            <p className="text-[12px] font-semibold sm:text-xs lg:text-sm">
              건국대학교 41대 학생복지위원회
            </p>
            <p className="text-[16px] font-semibold sm:text-lg lg:text-xl">
              연:連
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 text-[#410F07] sm:gap-5 md:flex lg:gap-7">
          <button type="button" className="font-semibold text-base">
            학생복지위원회
          </button>
          <button type="button" className="font-semibold text-base">
            중앙대여사업
          </button>
          <button type="button" className="font-semibold text-base">
            플로터인쇄사업
          </button>
          <button type="button" className="font-semibold text-base">
            로그인
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-[#410F07] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="메뉴 열기"
        >
          메뉴
        </button>
      </div>

      {/* Mobile dropdown */}
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
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
