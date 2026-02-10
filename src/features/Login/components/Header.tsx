import { useNavigate } from "react-router-dom";
import logo from "../../../assets/all/logo.svg";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:h-16 sm:px-6 lg:h-20 lg:px-7">
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
      </div>
    </header>
  );
}
