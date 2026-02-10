import Header from "../../components/Header";
import Footer from "../../components/Footer";

import rental from "../../assets/home/rental.svg";
import print from "../../assets/home/print.svg";
import cart from "../../assets/home/cart.svg";
import lost from "../../assets/home/lost.svg";
import board from "../../assets/home/board.svg";
import meeting from "../../assets/home/meeting.svg";

type ServiceItem = {
  title: string;
  desc: string;
  icon: string;
  align?: "leftIcon" | "rightIcon";
  onClick?: () => void;
};

const SERVICES: ServiceItem[] = [
  {
    title: "중앙대여사업",
    desc: "단위에 필요한 물품을 대여할 수 있습니다",
    icon: rental,
    align: "leftIcon",
  },
  {
    title: "플로터인쇄사업",
    desc: "대형 크기의 출력물을 인쇄할 수 있습니다",
    icon: print,
    align: "rightIcon",
  },
  {
    title: "제휴 / 통합 구매",
    desc: "학생들을 위한 제휴와 통합구매를 통해\n저렴하게 이용할 수 있습니다",
    icon: cart,
    align: "leftIcon",
  },
  {
    title: "분실물(학관 식당)",
    desc: "잃어버린 물품들을 찾을 수 있습니다",
    icon: lost,
    align: "rightIcon",
  },
  {
    title: "활동게시판",
    desc: "서비스 준비 중...",
    icon: board,
    align: "leftIcon",
  },
  {
    title: "소모임 지원",
    desc: "서비스 준비 중...",
    icon: meeting,
    align: "rightIcon",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      {/* 배너 */}
      <section className="w-full">
        <div
          className="
            relative w-full
            aspect-[4/3] sm:aspect-[16/9] md:h-[446px] md:aspect-auto
            overflow-hidden
            bg-[radial-gradient(circle_at_20%_40%,#FFE2B8_0%,transparent_60%),radial-gradient(circle_at_60%_50%,#FF8A6B_0%,transparent_55%),radial-gradient(circle_at_85%_30%,#E02000_0%,transparent_50%)]
          "
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="leading-[1.05]">
              <p className="font-bold text-white text-[32px] sm:text-[40px] md:text-[48px] [text-shadow:0_3px_4px_rgba(0,0,0,0.25)]">
                하나의 마음,
              </p>
              <p className="font-bold text-[#FBFFBF] text-[32px] sm:text-[40px] md:text-[48px] [text-shadow:0_3px_4px_rgba(0,0,0,0.25)]">
                이어지는 연
              </p>
            </div>

            <div className="mt-8 sm:mt-15 text-white text-[16px] sm:text-[20px] md:text-[28px]">
              건국대학교 41대 학생복지위원회 '연'
            </div>
          </div>
        </div>
      </section>

      {/* 주요 서비스 */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[980px] px-4 py-10 sm:py-14">
          <div className="text-center">
            <h2 className="text-[22px] sm:text-[32px] font-extrabold text-[#410F07]">
              주요 서비스
            </h2>
            <p className="mt-2 text-[13px] sm:text-[14px] text-[#410F07]">
              학생들의 편의를 위한 다양한 서비스를 제공합니다.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {SERVICES.map((item) => {
              const leftIcon = item.align !== "rightIcon";

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.onClick}
                  className="
                    group w-full text-left
                    rounded-[16px] border border-[#D72002] bg-white
                    px-6 py-10
                    min-h-[180px] sm:min-h-[200px]
                    shadow-[0_10px_22px_rgba(0,0,0,0.06)]
                    transition
                    hover:-translate-y-[1px] hover:shadow-[0_14px_26px_rgba(0,0,0,0.10)]
                    active:translate-y-0
                  "
                >
                  <div
                    className={`flex items-center justify-between gap-4 ${
                      leftIcon ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {/* 아이콘 */}
                    <img
                      src={item.icon}
                      alt=""
                      className="h-12 w-12 sm:h-14 sm:w-14 shrink-0"
                    />

                    {/* 텍스트 */}
                    <div
                      className={`min-w-0 ${
                        leftIcon ? "text-right mr-6" : "text-left ml-6"
                      }`}
                    >
                      <p className="text-[16px] sm:text-[20px] font-extrabold text-[#410F07]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[12px] sm:text-[13px] leading-[1.45] text-[#6B6B6B] whitespace-pre-line">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
