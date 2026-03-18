import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DepartmentCard from "../../components/Intro/DepartmentCard";
import { bureauData } from "../../../intro/departIntro.js";

const DEPARTMENT_ICONS: Record<string, string> = {
  "총괄국": "💻",
  "문화기획국": "🎪",
  "복지정책국": "🤝",
  "대외협력국": "🌐",
  "홍보디자인국": "📢",
  "사무국": "🗂️",
};

/**
 * 학생복지위원회 소개 페이지
 * 헤더의 "학생복지위원회"를 클릭하면 이 페이지로 이동합니다.
 */
export default function WelfareIntro() {
  const [activeTab, setActiveTab] = useState<"chairman" | "department">("chairman");

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 bg-white">
        {/* 상단 배너 섹션 - 슬로건 및 탭 */}
        <section 
          className="relative w-full bg-white"
        >
          {/* 배경 그래디언트 - 절대 위치로 배경처럼 처리 */}
          <div
            className="
              absolute top-0 left-0 right-0
              w-full h-[400px] md:h-[500px]
              bg-[radial-gradient(circle_at_20%_40%,#FFE2B8_0%,transparent_60%),radial-gradient(circle_at_60%_50%,#FF8A6B_0%,transparent_55%),radial-gradient(circle_at_85%_30%,#E02000_0%,transparent_50%)]
            "
          />


          {/* 슬로건 */}
          <div className="relative z-20 max-w-4xl mx-auto px-4 md:px-8 text-center mb-4 md:mb-6 pt-6 md:pt-8">
            <div className="leading-[1.05]">
              <p className="font-bold text-white text-[32px] sm:text-[40px] md:text-[48px] [text-shadow:0_3px_4px_rgba(0,0,0,0.25)]">
                학생복지위원회 소개
              </p>
            </div>
          </div>

          {/* 탭 및 콘텐츠 카드 영역 */}
          <div className="relative z-30 max-w-4xl mx-auto px-4 md:px-8 pb-12 md:pb-16">
            {/* 탭 버튼 */}
            <div className="flex flex-wrap gap-4 md:gap-8 mb-0 border-b-2 border-[#D9D9D9] bg-white rounded-t-3xl shadow-lg px-8 pt-8">
              <button
                onClick={() => setActiveTab("chairman")}
                className={`pb-2 font-medium text-[14px] md:text-[24px] relative whitespace-nowrap transition-colors ${
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
                className={`pb-2 font-medium text-[14px] md:text-[24px] relative whitespace-nowrap transition-colors ${
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
            </div>

            {/* 콘텐츠 카드 */}
            <div className="bg-white rounded-b-3xl shadow-lg p-8 md:p-12">
              {activeTab === "chairman" ? (
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">
                    <span className="text-black">하나의 마음,</span>
                    <br />
                    <span className="text-orange-500">이어지는 연</span>
                  </h2>
                  <div className="text-gray-700 text-lg leading-relaxed space-y-4">
                    <p>
                      안녕하세요. 건국대학교 41대 학생복지위원회 위원장 입니다.
                    </p>
                    <p>
                      학생복지위원회는 모든 학생들의 행복과 복지 증진을 위해
                      노력하는 기구입니다. 학생의 입장에서 생각하고, 학생을
                      위해 행동하는 학생복지위원회가 되겠습니다.
                    </p>
                    <p>
                      이 페이지를 통해 다양한 사업과 정보를 제공하고 있습니다.
                      여러분의 많은 관심과 참여 부탁드립니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 text-black">
                    국별 소개
                  </h2>
                  
                  {/* 각 국별 카드 */}
                  <div className="space-y-6">
                    {bureauData.map((bureau) => (
                      <DepartmentCard
                        key={bureau.id}
                        icon={DEPARTMENT_ICONS[bureau.name] ?? "🏛️"}
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
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
