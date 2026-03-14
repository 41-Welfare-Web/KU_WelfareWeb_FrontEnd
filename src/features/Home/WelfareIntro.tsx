import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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
                    {/* 홍보디자인국 */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-orange-100 h-32 flex items-center px-8">
                        <div className="bg-white rounded-lg w-20 h-20 flex items-center justify-center shadow-md mr-6">
                          <span className="text-4xl">📢</span>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-black">홍보디자인국</h3>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className="text-gray-600 text-lg mb-8">
                          홍보디자인국은 학생복지위원회가 기획하고 진행하는 모든 사업을 학우분들께 가장 먼저, 그리고 가장 효과적으로 전달하는 부서입니다. 모든 온·오프라인 홍보 및 디자인 프로세스를 총괄합니다.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">SNS 관리</h4>
                            <p className="text-gray-700 text-sm">
                              복지 사업들이 학우분들의 일상에 실질적으로 닿을 수 있도록, SNS 운영 전반을 총괄하고 트렌디한 콘텐츠를 기획합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">홍보물 및 굿즈 디자인</h4>
                            <p className="text-gray-700 text-sm">
                              다양한 사업과 행사의 시각적 완성도를 높이기 위해, 포스터, 현수막 등 모든 홍보물의 디자인을 전담합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 복지정책국 */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-orange-100 h-32 flex items-center px-8">
                        <div className="bg-white rounded-lg w-20 h-20 flex items-center justify-center shadow-md mr-6">
                          <span className="text-4xl">🤝</span>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-black">복지정책국</h3>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className="text-gray-600 text-lg mb-8">
                          복지정책국은 학우들이 학교생활 속에서 실질적으로 체감할 수 있는 다양한 복지 서비스를 기획하고 운영하는 중심 부서입니다. '당연하게 누려야 할 권리'를 넘어 '안심하고 누릴 수 있는 일상'을 제공합니다.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">학과 집기 대여 사업</h4>
                            <p className="text-gray-700 text-sm">
                              학생들의 원활한 학과 활동 및 행사 지원을 위해 각종 필요 집기를 관리하고 대여합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">학식 서포터즈</h4>
                            <p className="text-gray-700 text-sm">
                              캠퍼스 생활의 큰 즐거움인 '식사'의 질을 높이기 위해 학식 서포터즈를 기획하고 진행합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">불법 촬영물 탐지</h4>
                            <p className="text-gray-700 text-sm">
                              학우들이 교내 화장실 및 편의시설을 안심하고 이용할 수 있도록 정기적인 탐지 점검을 실시합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">교내 인쇄 사업</h4>
                            <p className="text-gray-700 text-sm">
                              대형 인쇄물이 필요한 학우들을 위해 플로터 기기 사용을 지원합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 총괄국 */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="bg-orange-100 h-32 flex items-center px-8">
                        <div className="bg-white rounded-lg w-20 h-20 flex items-center justify-center shadow-md mr-6">
                          <span className="text-4xl">💻</span>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-black">총괄국</h3>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className="text-gray-600 text-lg mb-8">
                          총괄국은 학생 복지를 위한 '중앙 대여 사업'과 '학생복지위원회 재실 근무'를 총괄하며, 학생복지위원회 내의 물자 관리와 홈페이지 운영 등의 업무를 수행합니다.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">중앙대여사업</h4>
                            <p className="text-gray-700 text-sm">
                              학우분들의 학교생활 편의를 위해 다양한 물자를 기획하고 집행하는 총괄국의 핵심 사업입니다. 기존의 정기 물자 관리에서 나아가 물자 개편 및 다각화도 진행합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">재실근무 총괄</h4>
                            <p className="text-gray-700 text-sm">
                              학생복지위원회의 다양한 사업을 효율적으로 운영하기 위해 재실근무를 전반적으로 관리하는 업무를 담당합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">홈페이지 개발 및 운영</h4>
                            <p className="text-gray-700 text-sm">
                              학생복지위원회 자체 홈페이지를 직접 개발하고 원활하게 운영될 수 있도록 관리하는 업무를 담당합니다.
                            </p>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-6">
                            <h4 className="font-bold text-black text-lg mb-3">녹색지대 지원</h4>
                            <p className="text-gray-700 text-sm">
                              건국대학교의 가장 큰 행사인 '녹색지대 축제'가 성공적으로 개최될 수 있도록 주점 및 부스 운영을 지원합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
