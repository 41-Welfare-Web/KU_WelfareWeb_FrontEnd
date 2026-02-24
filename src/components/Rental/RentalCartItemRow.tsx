import cancel from "../../assets/rental/cancel.svg";

type Status = "WAIT" | "OK" | "NO";

export type RentalCartRowItem = {
  cartId: number;
  itemId: number;
  name: string;
  categoryName?: string;
  count: number;
  imageUrl?: string;
  startDate: string | null;
  endDate: string | null;
};

type Props = {
  item: RentalCartRowItem;
  selected?: boolean;
  status: Status;
  onSelect: () => void;
  onRemove: () => void;
  onChangeQty: (nextQty: number) => void;
};

function toMMDD(ymd: string) {
  const m = Number(ymd.slice(5, 7));
  const d = ymd.slice(8, 10);
  return `${m}.${d}`;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "WAIT") {
    return (
      <span className="px-2 py-1 rounded-md bg-[#D9D9D9] text-[#555] text-[12px] font-semibold">
        기간 선택 대기
      </span>
    );
  }
  if (status === "OK") {
    return (
      <span className="px-2 py-1 rounded-md bg-[#A6F4A6] text-[#0A7A0A] text-[12px] font-semibold">
        ✓ 대여 가능
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-md bg-[#FFA2A2] text-[#B00000] text-[12px] font-semibold">
      대여 불가
    </span>
  );
}

export default function RentalCartItemRow({
  item,
  selected,
  status,
  onSelect,
  onRemove,
  onChangeQty,
}: Props) {
  const hasDates = !!item.startDate && !!item.endDate;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={[
        "w-full text-left rounded-2xl border border-black/10",
        "px-4 py-3",
        "relative",
        "transition",
        selected ? "bg-[#D7D7D7]" : "bg-[#EFEFEF]",
        "hover:bg-[#E3E3E3]",
      ].join(" ")}
    >
      {/* X : 오른쪽 상단 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="
    absolute top-3 right-2
    w-8 h-8
    flex items-center justify-center
    rounded-full
    hover:bg-black/10
    transition
  "
        aria-label="삭제"
      >
        <img
          src={cancel}
          alt="취소"
          className="w-3.5 h-3.5 pointer-events-none"
        />
      </button>

      <div className="flex items-start gap-4">
        {/* 썸네일 (작게) */}
        <div className="h-14 w-14 shrink-0 rounded-full bg-white overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        {/* 본문 */}
        <div className="flex-1 min-w-0 relative">
          {/* 상단: 카테고리/이름 */}
          <div className="pr-8">
            <div className="text-[#FE6949] font-bold text-[12px]">
              {item.categoryName ?? ""}
            </div>
            <div className="mt-0.5 text-[#3B160D] font-extrabold text-[clamp(16px,1.8vw,22px)] leading-tight truncate">
              {item.name}
            </div>

            {/* 기간 + 상태 */}
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-white text-[#3B160D] text-[12px] font-semibold">
                {hasDates
                  ? `${toMMDD(item.startDate!)} ~ ${toMMDD(item.endDate!)}`
                  : "기간 미선택"}
              </span>
              <StatusBadge status={status} />
            </div>
          </div>

          {/* 수량 : 왼쪽 하단 */}
          <div className="mt-3 flex justify-end items-center gap-2">
            <div className="text-[#3B160D] text-[13px] font-semibold">수량</div>

            <div className="flex items-center rounded-lg bg-white border border-black/10 overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQty(Math.max(1, item.count - 1));
                }}
                className="w-8 h-8 hover:bg-black/5"
                aria-label="수량 감소"
              >
                –
              </button>

              <div className="w-9 text-center text-[13px] font-bold">
                {item.count}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQty(item.count + 1);
                }}
                className="w-8 h-8 hover:bg-black/5"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>

            <div className="text-[#3B160D] text-[13px]">개</div>
          </div>
        </div>
      </div>
    </div>
  );
}
