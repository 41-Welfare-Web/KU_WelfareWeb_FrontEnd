type TabKey = "findId" | "resetPw";

type Props = {
  value: TabKey;
  onChange: (v: TabKey) => void;
};

export default function FindAccountTabs({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-8 sm:gap-10">
      <button
        type="button"
        onClick={() => onChange("findId")}
        className="text-center"
      >
        <div
          className={`text-[clamp(18px,5vw,30px)] font-bold ${
            value === "findId" ? "text-[#FF7A57]" : "text-black"
          }`}
        >
          아이디 찾기
        </div>
        <div
          className={`mt-2 h-[3px] w-full rounded-full ${
            value === "findId" ? "bg-[#FF7A57]" : "bg-transparent"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange("resetPw")}
        className="text-center"
      >
        <div
          className={`text-[clamp(18px,5vw,30px)] font-bold ${
            value === "resetPw" ? "text-[#FF7A57]" : "text-black"
          }`}
        >
          비밀번호 초기화
        </div>
        <div
          className={`mt-2 h-[3px] w-full rounded-full ${
            value === "resetPw" ? "bg-[#FF7A57]" : "bg-transparent"
          }`}
        />
      </button>
    </div>
  );
}
