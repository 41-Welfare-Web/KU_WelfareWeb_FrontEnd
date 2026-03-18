import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PartnershipTabs, {
  type PartnershipTabKey,
} from "../../components/Partnership/PartnershipTabs";
import PartnershipCard, {
  type PartnershipCardItem,
} from "../../components/Partnership/PartnershipCard";
import GroupPurchaseComingSoon from "../../components/Partnership/GroupPurchaseComingSoon";

import bus from "../../assets/parnership/bus.svg";
import cloth from "../../assets/parnership/cloth.svg";
import eduwill from "../../assets/parnership/eduwill.svg";
import eye from "../../assets/parnership/eye.svg";

export default function Partnership() {
  const [tab, setTab] = useState<PartnershipTabKey>("partnership");

  const partnershipItems: PartnershipCardItem[] = [
    {
      id: 1,
      category: "교통/이동",
      title: "연 X 삼우고속",
      description: "합리하고 편안한 이동을 위한 버스 대절 제휴",
      imageUrl: bus,
      link: "https://www.instagram.com/p/DTcuEwek5u3/?igsh=MXV5Y2FsYzRnNzk0Yg==",
    },
    {
      id: 2,
      category: "교육/학습",
      title: "연 X 에듀윌",
      description: "학우들의 자격증/취업 준비를 위한 특별 할인",
      imageUrl: eduwill,
      link: "https://www.instagram.com/p/DTndrFOkz-D/?igsh=MTYxMzc4cWEwdWNvcA==",
    },
    {
      id: 3,
      category: "의료/건강",
      title: "연 X 밝은성모안과",
      description: "건국인만을 위한 시력교정술 특별 제휴 혜택",
      imageUrl: eye,
      link: "https://www.instagram.com/p/DT1lEomk5pi/?igsh=MXBjcTNpYmRqbnR6dQ==",
    },
    {
      id: 4,
      category: "의류/단체복",
      title: "연 X 디엔진",
      description: "과잠, 단체복 제작 시 누리는 건국대 특별 혜택",
      imageUrl: cloth,
      link: "https://www.instagram.com/p/DVnoj_Jk2ta/?igsh=Y3A0anVkOTY0NGZq",
    },
  ];

  return (
    <>
      <Header />

      <main className="bg-[#FBF0E8] min-h-[calc(100dvh-160px)]">
        <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-10 lg:px-12 pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-24">
          <div className="text-[#410F07]">
            <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold leading-tight">
              제휴/통합구매
            </h1>
            <p className="mt-3 text-[14px] sm:text-[16px] md:text-[20px] leading-[1.6]">
              업체와의 제휴를 통해 학생들이 보다 합리적인 혜택을 얻을 수
              있습니다.
            </p>
          </div>

          <div className="mt-10 sm:mt-12">
            <PartnershipTabs value={tab} onChange={setTab} />
          </div>

          {tab === "partnership" ? (
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {partnershipItems.map((item) => (
                <PartnershipCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <GroupPurchaseComingSoon />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
