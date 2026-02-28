import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PlotterRequestSummary from "../../components/Plotter/PlotterRequestSummary";
import LogoCircle from "../../assets/plotter/logo-circle.svg";

type LocationState = {
  orderId?: number;
  name?: string;
  studentNo?: string;
  phone?: string;
  purpose?: string;
  quantity?: number;
  paperSize?: string;
  expectedDate?: string;
  price?: number;
  status?: string;
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
  const rawExpectedDate = state?.expectedDate || "2026-01-10";
  
  // 날짜 포맷팅: ISO 형식에서 YYYY-MM-DD만 추출
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };
  
  const expectedDate = formatDate(rawExpectedDate);

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-10 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-3 md:px-4 pt-8 md:pt-16">
          {/* 로고 서클 */}
          <div className="flex justify-center mb-4 md:mb-8">
            <img src={LogoCircle} alt="Logo" className="w-[80px] h-[80px] md:w-[131px] md:h-[131px]" />
          </div>

          {/* 완료 메시지 */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-[32px] md:text-[50px] font-bold text-[#410f07] mb-2 md:mb-4">
              예약이 완료되었습니다!
            </h1>
            <p className="text-[16px] md:text-[30px] text-[#410f07] leading-relaxed px-4">
              수령 가능일부터 학생복지위원회실에<br />
              방문하여 출력물을 수령해주시기 바랍니다.
            </p>
          </div>

          {/* 신청 정보 요약 */}
          <div className="flex justify-center mt-6 md:mt-12 px-3">
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
          <div className="max-w-[782px] mx-auto px-3">
            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 md:mt-8 h-[50px] md:h-[63px] bg-[#f72] rounded-[10px] shadow-lg text-white text-[18px] md:text-[24px] font-bold hover:bg-[#e65a3d] transition"
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
