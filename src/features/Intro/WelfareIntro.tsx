import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DepartmentCard from "../../components/Intro/DepartmentCard";
import { bureauData } from "../../../intro/departIntro.js";
import { greetingData } from "../../../intro/leaderIntro.js";
import chairpersonImage from "../../../intro/위원장.png";
import viceChairpersonImage from "../../../intro/부위원장.png";
import orgChartImage from "../../assets/Intro/조직도.png";

const bureauIconModules = import.meta.glob("../../assets/Intro/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const bureauIconByName = Object.fromEntries(
  Object.entries(bureauIconModules).map(([path, iconSrc]) => {
    const match = path.match(/\/([^/]+)\.svg$/);
    const bureauName = match?.[1] ?? path;
    return [bureauName, iconSrc];
  }),
) as Record<string, string>;

/**
 * 학생복지위원회 소개 페이지
 * 헤더의 "학생복지위원회"를 클릭하면 이 페이지로 이동합니다.
 */
export default function WelfareIntro() {
  const [activeTab, setActiveTab] = useState<
    "chairman" | "department" | "orgchart"
  >("chairman");
  const chairGreeting =
    greetingData.find((greeting) => greeting.id === "chairperson") ??
    greetingData[0];
  const viceGreeting =
    greetingData.find((greeting) => greeting.id === "vice-chairperson") ??
    greetingData[1];
  const chairGreetingParagraphs = (chairGreeting?.content ?? "")
    .split("\n\n")
    .map((text) => text.trim())
    .filter(Boolean);
  const viceGreetingParagraphs = (viceGreeting?.content ?? "")
    .split("\n\n")
    .map((text) => text.trim())
    .filter(Boolean);

  const GreetingProfile = ({
    role,
    name,
    imageSrc,
    className = "",
  }: {
    role?: string;
    name?: string;
    imageSrc: string;
    className?: string;
  }) => (
    <aside
      className={`w-[180px] sm:w-[220px] max-w-full mx-auto lg:mx-0 shrink-0 ${className}`}
    >
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/92">
          <img
            src={imageSrc}
            alt={`${role ?? "임원"} ${name ?? "프로필"}`}
            className="w-full aspect-[3/4] object-cover"
          />
          <div className="px-4 py-3 text-center bg-[#FAFAFA]/92 border-t border-white/50">
            <p className="text-[14px] md:text-[15px] text-[#8E8E8E] font-medium">
              {role ?? "-"}
            </p>
            <p className="text-[18px] md:text-[20px] text-[#1F2937] font-bold mt-1">
              {name ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 bg-white">
        {/* 상단 배너 섹션 - 슬로건 및 탭 */}
        <section className="relative w-full bg-white">
          {/* 배경 그래디언트 - 절대 위치로 배경처럼 처리 */}
          <div
            className="
              absolute top-0 left-0 right-0
              w-full h-[280px] sm:h-[360px] md:h-[460px] lg:h-[520px]
              bg-[radial-gradient(circle_at_20%_40%,#FFE2B8_0%,transparent_60%),radial-gradient(circle_at_60%_50%,#FF8A6B_0%,transparent_55%),radial-gradient(circle_at_85%_30%,#E02000_0%,transparent_50%)]
            "
          />

          {/* 슬로건 */}
          <div className="relative z-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 text-center mb-4 md:mb-6 pt-6 md:pt-8">
            <div className="leading-[1.05]">
              <p className="font-bold text-white text-[32px] sm:text-[40px] md:text-[48px] [text-shadow:0_3px_4px_rgba(0,0,0,0.25)]">
                학생복지위원회 소개
              </p>
            </div>
          </div>

          {/* 탭 및 콘텐츠 카드 영역 */}
          <div className="relative z-30 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-10 sm:pb-12 md:pb-16">
            {/* 탭 버튼 */}
            <div className="overflow-x-auto scrollbar-hide rounded-t-3xl shadow-lg">
              <div className="flex w-max min-w-full gap-4 sm:gap-8 mb-0 border-b-2 border-[#D9D9D9] bg-white px-5 sm:px-8 pt-5 sm:pt-8">
                <button
                  onClick={() => setActiveTab("chairman")}
                  translate="no"
                  className={`pb-2 font-medium text-[13px] sm:text-[18px] md:text-[24px] relative whitespace-normal md:whitespace-nowrap break-keep transition-colors ${
                    activeTab === "chairman"
                      ? "text-[#FE6949]"
                      : "text-[#8E8E8E] hover:text-[#FE6949]"
                  }`}
                >
                  위원장 인사말
                  {activeTab === "chairman" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FE6949]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("department")}
                  translate="no"
                  className={`pb-2 font-medium text-[13px] sm:text-[18px] md:text-[24px] relative whitespace-normal md:whitespace-nowrap break-keep transition-colors ${
                    activeTab === "department"
                      ? "text-[#FE6949]"
                      : "text-[#8E8E8E] hover:text-[#FE6949]"
                  }`}
                >
                  국별 소개
                  {activeTab === "department" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FE6949]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("orgchart")}
                  translate="no"
                  className={`pb-2 font-medium text-[13px] sm:text-[18px] md:text-[24px] relative whitespace-normal md:whitespace-nowrap break-keep transition-colors ${
                    activeTab === "orgchart"
                      ? "text-[#FE6949]"
                      : "text-[#8E8E8E] hover:text-[#FE6949]"
                  }`}
                >
                  조직도
                  {activeTab === "orgchart" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FE6949]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* 콘텐츠 카드 */}
            <div className="bg-white rounded-b-3xl shadow-lg p-5 sm:p-7 md:p-9 lg:p-12">
              {activeTab === "chairman" ? (
                <div>
                  <h2 className="text-[34px] sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8">
                    <span className="text-black">하나의 마음,</span>
                    <br />
                    <span className="text-orange-500">이어지는 연</span>
                  </h2>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 text-black">
                    위원장 인사말
                  </h3>
                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-start">
                    <div className="flex-1 min-w-0 text-gray-700 text-[15px] sm:text-base lg:text-lg leading-relaxed space-y-4">
                      {chairGreetingParagraphs.map((paragraph, index) => (
                        <p
                          key={`${chairGreeting?.id ?? "greeting"}-${index}`}
                          className="whitespace-pre-line"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <GreetingProfile
                      role={chairGreeting?.role}
                      name={chairGreeting?.name}
                      imageSrc={chairpersonImage}
                      className="lg:order-first lg:self-end"
                    />
                  </div>

                  {viceGreeting && (
                    <>
                      <hr className="my-8 sm:my-10 border-t border-[#D9D9D9]" />
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 text-black">
                        부위원장 인사말
                      </h3>
                      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-start">
                        <div className="flex-1 min-w-0 text-gray-700 text-[15px] sm:text-base lg:text-lg leading-relaxed space-y-4">
                          {viceGreetingParagraphs.map((paragraph, index) => (
                            <p
                              key={`${viceGreeting.id}-${index}`}
                              className="whitespace-pre-line"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <GreetingProfile
                          role={viceGreeting.role}
                          name={viceGreeting.name}
                          imageSrc={viceChairpersonImage}
                          className="lg:self-end"
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : activeTab === "department" ? (
                <div>
                  <h2 className="text-[34px] sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-black">
                    국별 소개
                  </h2>

                  {/* 각 국별 카드 */}
                  <div className="space-y-6">
                    {bureauData.map((bureau) => (
                      <DepartmentCard
                        key={bureau.id}
                        icon={bureauIconByName[bureau.name] ?? "🏛️"}
                        name={bureau.name}
                        description={bureau.description}
                        projects={bureau.projects.map((project) => ({
                          title: project.title,
                          description: project.contents.join(" "),
                        }))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-center">
                    <img
                      src={orgChartImage}
                      alt="학생복지위원회 조직도"
                      className="w-full max-w-3xl object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
