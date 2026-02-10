import instagram from "../assets/all/instagram.svg";
import kakaotalk from "../assets/all/kakaotalk.svg";

export default function Footer() {
  return (
    <footer className="w-full bg-[#FCDBA4]">
      <div className="mx-auto w-full max-w-[980px] px-4 py-4 sm:py-8 text-center">
        {/* 아이콘들 */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/ku_welfare?igsh=MTAyNHFra210aWxheA=="
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="인스타그램"
          >
            <img src={instagram} alt="인스타그램" className="h-5 w-5" />
          </a>

          <a
            href="https://pf.kakao.com/_xawxojxb"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="카카오톡"
          >
            <img src={kakaotalk} alt="카카오톡" className="h-5 w-5" />
          </a>
        </div>

        {/* 로고/타이틀 */}
        <div className="mt-6 flex flex-col items-center gap-8">
          {/* 로고 */}
          <div className="inline-flex items-center justify-center border-2 border-black px-6 py-3">
            <div className="flex items-center gap-3">
              {/* KU */}
              <div className="leading-none">
                <span className="block text-[64px] sm:text-[80px] font-semibold font-crimson text-black">
                  KU
                </span>
              </div>

              {/* 건국대학교 / KONKUK UNIV. */}
              <div className="text-left leading-tight">
                <div className="text-[22px] sm:text-[28px] text-black font-noto-serif-kr">
                  건국대학교
                </div>
                <div className="text-[18px] sm:text-[24px] tracking-[0.02em] text-black font-playfair">
                  KONKUK UNIV.
                </div>
              </div>
            </div>
          </div>

          <div className="text-[#2B1B14]">
            <p className="text-[14px] sm:text-[15px] font-semibold [font-family:var(--font-crimson)]">
              건국대학교 41대 학생복지위원회 연
            </p>
            <p className="mt-1 text-[12px] sm:text-[13px] font-semibold tracking-[0.02em] [font-family:var(--font-crimson)]">
              KONKUK UNIVERSITY THE 41ST STUDENT WELFARE COUNCIL
            </p>

            <p className="mt-6 text-[12px] sm:text-[13px] leading-[1.6] font-semibold text-[#3A2A23]/80 [font-family:var(--font-crimson)]">
              서울특별시 광진구 능동로 120
              <br />
              건국대학교 제1학생회관 B102호
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
