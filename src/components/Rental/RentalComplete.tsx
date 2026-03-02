import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// 플로터와 같은 로고를 쓰고 싶으면 그대로 import
import LogoCircle from "../../assets/plotter/logo-circle.svg";

import RentalRequestSummary from "../../components/Rental/RentalRequestSummary";
import type { RentalCreateResponse, Rental } from "../../api/rental/types";

type LocationState = {
  result?: RentalCreateResponse; // createRentals 응답 전체
};

function toYmd(dateString: string) {
  if (!dateString) return "";
  return dateString.includes("T")
    ? dateString.split("T")[0]
    : dateString.slice(0, 10);
}

export default function RentalComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const rentals: Rental[] = state?.result?.rentals ?? [];
  const first = rentals[0];

  // 안전 fallback
  const applicantName = first?.user?.name ?? "홍길동";
  const studentNo = first?.user?.studentId ?? "202112345";
  const phone = first?.user?.phoneNumber ?? "010-1234-5678";

  // 여러 rental이 올 수 있으니, 기간은 "전체 최소~최대"로 잡아줌
  const startDate = rentals.length
    ? rentals.map((r) => toYmd(r.startDate)).sort()[0]
    : "2026-01-10";
  const endDate = rentals.length
    ? rentals
        .map((r) => toYmd(r.endDate))
        .sort()
        .slice(-1)[0]
    : "2026-01-14";

  // 상단 리스트에 보여줄 아이템들(모든 rentals의 rentalItems flatten)
  const items =
    rentals.flatMap((r) =>
      (r.rentalItems ?? []).map((ri) => ({
        name: ri.item?.name ?? `item#${ri.itemId}`,
        range: `${toYmd(r.startDate)} ~ ${toYmd(r.endDate)}`,
        qty: ri.quantity ?? 1,
      })),
    ) ?? [];

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

          {/* 완료 메시지 */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-[32px] md:text-[50px] font-bold text-[#410f07] mb-2 md:mb-4">
              예약이 완료되었습니다!
            </h1>
            <p className="text-[16px] md:text-[30px] text-[#410f07] leading-relaxed px-4">
              신청하신 날짜에 학생복지위원회실에
              <br />
              방문하여 물품을 수령해주시기 바랍니다.
            </p>
          </div>

          {/* 신청 정보 요약 */}
          <div className="flex justify-center mt-6 md:mt-12 px-3">
            <RentalRequestSummary
              items={items}
              startDate={startDate}
              endDate={endDate}
              applicantName={`${applicantName} (${studentNo})`}
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
