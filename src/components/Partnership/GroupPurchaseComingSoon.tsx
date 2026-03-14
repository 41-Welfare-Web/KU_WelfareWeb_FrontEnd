import { useNavigate } from "react-router-dom";
import commingSoon from "../../assets/parnership/comminSoon.svg";

export default function GroupPurchaseComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-14 sm:py-20 md:py-24 text-center">
      <div className="flex items-center justify-center">
        <img
          src={commingSoon}
          alt="서비스 준비중"
          className="w-[88px] sm:w-[100px] md:w-[116px] h-auto"
        />
      </div>

      <h2 className="mt-8 text-[20px] sm:text-[30px] md:text-[40px] font-extrabold text-[#410F07] leading-tight">
        서비스 준비 중입니다
      </h2>

      <p className="mt-6 text-[14px] sm:text-[18px] md:text-[22px] text-[#410F07] leading-[1.15] font-medium">
        더 나은 조건으로 학우 여러분께 혜택을 제공하기 위해
        <br />
        통합 구매 서비스를 열심히 기획하고 있습니다.
        <br />
        조금만 기다려주세요!
      </p>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-10 sm:mt-12 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] h-12 sm:h-14 rounded-[10px] bg-[#FF7A1A] text-white text-[16px] sm:text-[18px] md:text-[22px] font-bold shadow-[0_4px_0_rgba(0,0,0,0.15)] active:translate-y-[1px] transition"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
