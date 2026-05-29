import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LogoCircle from "../../assets/plotter/logo-circle.svg";

export default function InspectionScreen() {
  return (
    <>
      <Header />

      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-10 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-3 md:px-4 pt-8 md:pt-16">
          {/* 로고 서클 */}
          <div className="flex justify-center mb-4 md:mb-8">
            <img
              src={LogoCircle}
              alt="Logo"
              className="w-[80px] h-[80px] md:w-[131px] md:h-[131px]"
            />
          </div>

          {/* 타이틀 */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-[28px] md:text-[46px] font-bold text-[#410f07] mb-2 md:mb-4">
              홈페이지 점검 안내
            </h1>
          </div>

          {/* 점검 안내 카드 */}
          <div className="max-w-[782px] mx-auto bg-white rounded-[20px] shadow-lg px-6 py-8 md:px-12 md:py-12">
            <p className="text-[16px] md:text-[20px] text-[#333] leading-relaxed mb-6 md:mb-8 text-center">
              현재 시스템 점검이 진행 중입니다.
            </p>

            <p className="text-[14px] md:text-[17px] text-[#555] leading-relaxed mb-8 md:mb-10 text-center">
              보다 안정적이고 편리한 서비스 제공을 위해 점검을 진행하고 있으니
              이용에 양해 부탁드립니다.
            </p>

            {/* 점검 시간 강조 박스 */}
            <div className="bg-[#fff5f0] border border-[#ffdcc5] rounded-[12px] px-6 py-5 mb-8 md:mb-10 text-center">
              <p className="text-[14px] md:text-[16px] text-[#888] font-medium mb-1">
                점검 시간
              </p>
              <p className="text-[22px] md:text-[28px] font-bold text-[#f72]">
                00:00 ~ 05:00
              </p>
            </div>

            <div className="text-center space-y-1">
              <p className="text-[14px] md:text-[16px] text-[#555]">
                더 나은 홈페이지로 찾아뵙겠습니다.
              </p>
              <p className="text-[14px] md:text-[16px] text-[#555] font-medium">
                감사합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
