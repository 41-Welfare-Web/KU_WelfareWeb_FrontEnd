import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PlotterRequestSummary from "../../components/ui/PlotterRequestSummary";
import LogoCircle from "../../assets/plotter/logo-circle.svg";

type LocationState = {
  name?: string;
  studentNo?: string;
  phone?: string;
  purpose?: string;
  quantity?: number;
  expectedDate?: string;
};

export default function PlotterComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const name = state?.name || "홍길동";
  const studentNo = state?.studentNo || "202112345";
  const phone = state?.phone || "010-1234-5678";
  const purpose = state?.purpose || "대자보";
  const quantity = state?.quantity || 1;
  const expectedDate = state?.expectedDate || "2026-01-10";

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 pt-16">
          {/* 로고 서클 */}
          <div className="flex justify-center mb-8">
            <img src={LogoCircle} alt="Logo" className="w-[131px] h-[131px]" />
          </div>

          {/* 완료 메시지 */}
          <div className="text-center mb-6">
            <h1 className="text-[50px] font-bold text-[#410f07] mb-4">
              예약이 완료되었습니다!
            </h1>
            <p className="text-[30px] text-[#410f07] leading-relaxed">
              수령 예정일 이후에 학생복지위원회실에<br />
              방문하여 출력물을 수령해주시기 바랍니다.
            </p>
          </div>

          {/* 신청 정보 요약 */}
          <div className="flex justify-center mt-12">
            <PlotterRequestSummary
              purpose={purpose}
              quantity={quantity}
              expectedDate={expectedDate}
              applicantName={name}
              studentNo={studentNo}
              phone={phone}
            />
          </div>

          {/* 홈으로 돌아가기 버튼 */}
          <div className="max-w-[782px] mx-auto">
            <button
              onClick={() => navigate("/")}
              className="w-full mt-8 h-[63px] bg-[#f72] rounded-[10px] shadow-lg text-white text-[24px] font-bold hover:bg-[#e65a3d] transition"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
