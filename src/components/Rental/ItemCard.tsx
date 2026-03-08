import type { Item } from "../../api/rental/types";
import exampleImg from "../../assets/rental/exampleImg.svg";

type Props = {
  item: Item;
  onClick?: () => void;
};

export default function ItemCard({ item, onClick }: Props) {
  const qty = item.totalQuantity;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full rounded-[11px] border border-[#D72002] bg-white overflow-hidden shadow-md transition hover:-translate-y-[2px]"
    >
      <div className="aspect-[4/3] w-full bg-white">
        <img
          src={item.imageUrl ?? exampleImg}
          alt={item.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[#FE6949] text-[11px] sm:text-[13px] font-medium">
            {item.category?.name}
          </span>

          <span className="rounded-full bg-[#D9D9D9] px-2 sm:px-3 py-[2px] sm:py-1 text-[10px] sm:text-xs font-medium">
            수량 {qty}개
          </span>
        </div>

        <p className="mt-1 sm:mt-2 text-[16px] sm:text-[20px] font-extrabold text-[#410F07]">
          {item.name}
        </p>

        <p className="mt-1 text-[12px] sm:text-sm text-[#410F07] line-clamp-1">
          {item.description}
        </p>
      </div>
    </button>
  );
}
