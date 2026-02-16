import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type LocationState = {
  name?: string;
  studentNo?: string;
  phone?: string;
};

export default function PlotterComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const name = state?.name || "홍길동";
  const studentNo = state?.studentNo || "202112345";
  const phone = state?.phone || "010-1234-5678";

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 pt-16">
          {/* 체크마크 아이콘 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-[131px] h-[131px]">
              <div className="absolute inset-0 bg-white rounded-full shadow-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-[115px] h-[115px]" viewBox="0 0 115 115" fill="none">
                  <circle cx="57.5" cy="57.5" r="47.5" fill="#FF7755" />
                  <path 
                    d="M35 57.5L50 72.5L80 42.5" 
                    stroke="white" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
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

          {/* 신청자 정보 카드 */}
          <div className="max-w-[782px] mx-auto mt-12">
            <div className="bg-white rounded-t-[17px] p-8">
              <div className="flex justify-between items-center">
                <span className="text-[25px] text-[#676767]">신청자</span>
                <span className="text-[25px] text-black font-medium">
                  {name} ({studentNo})
                </span>
              </div>
            </div>
            
            <div className="h-px bg-gray-300"></div>
            
            <div className="bg-white rounded-b-[17px] p-8">
              <div className="flex justify-between items-center">
                <span className="text-[25px] text-[#676767]">연락처</span>
                <span className="text-[25px] text-black font-medium">
                  {phone}
                </span>
              </div>
            </div>

            {/* 홈으로 돌아가기 버튼 */}
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
