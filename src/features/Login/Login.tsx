import Header from "./components/Header";

export default function Login() {
  return (
    <>
      <Header />

      <main className="min-h-[calc(100dvh-80px)] px-4 flex items-center justify-center bg-white overflow-hidden">
        <section className="w-full max-w-[520px] rounded-[18px] border border-[#FF7A57] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <div className="px-5 sm:px-8 py-8 sm:py-10">
            <h1 className="text-center text-[28px] sm:text-[32px] font-extrabold text-black">
              로그인
            </h1>

            <form className="mt-7 sm:mt-9 space-y-5">
              {/* 학번 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  학번
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <label className="block text-[16px] font-semibold text-black">
                  비밀번호
                </label>
                <input
                  type="password"
                  className="w-full h-12 sm:h-14 rounded-[10px] bg-[#EFEFEF] px-4 text-[16px] outline-none ring-0 focus:bg-white focus:ring-2 focus:ring-[#FF7A57]/40"
                />
              </div>

              {/* 로그인 버튼 */}
              <button
                type="button"
                className="mt-2 w-full h-12 sm:h-14 rounded-[10px] bg-[#FD7D5D] text-white text-[18px] font-bold active:scale-[0.99] transition"
              >
                로그인하기
              </button>

              {/* 하단 링크 */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[16px] text-[#868686]">
                <button type="button" className="hover:text-[#555]">
                  아이디/비밀번호 찾기
                </button>
                <span className="text-[#868686]">|</span>
                <button type="button" className="hover:text-[#555]">
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
