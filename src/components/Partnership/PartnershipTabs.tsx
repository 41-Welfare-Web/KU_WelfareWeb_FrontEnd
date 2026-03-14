export type PartnershipTabKey = "partnership" | "groupPurchase";

type Props = {
  value: PartnershipTabKey;
  onChange: (next: PartnershipTabKey) => void;
};

export default function PartnershipTabs({ value, onChange }: Props) {
  const tabs: { key: PartnershipTabKey; label: string }[] = [
    { key: "partnership", label: "제휴 사업" },
    { key: "groupPurchase", label: "통합 구매" },
  ];

  return (
    <div className="w-full border-b border-[#C8B7AE]">
      <div className="grid grid-cols-2">
        {tabs.map((tab) => {
          const active = value === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={[
                "relative h-12 sm:h-14 md:h-[60px] text-center font-bold transition",
                "text-[18px] sm:text-[24px] md:text-[28px]",
                active
                  ? "text-[#FF7A57]"
                  : "text-[#410F07] hover:text-[#FF7A57]",
              ].join(" ")}
            >
              {tab.label}

              {active && (
                <span className="absolute left-0 bottom-[-1px] h-[2px] w-full bg-[#FF7A57]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
