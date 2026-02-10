import Header from "../../components/Header";

export default function Home() {
  return (
    <>
      <Header />
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
    </>
  );
}
