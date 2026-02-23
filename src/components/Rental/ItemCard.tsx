import type { Item } from "../../features/Rental/RentalList";
import exampleImg from "../../assets/rental/exampleImg.svg";

type Props = {
  item: Item;
  onClick?: (item: Item) => void;
};

export default function ItemCard({ item, onClick }: Props) {
  const qty = item.totalQuantity;

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
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

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[#FE6949] text-[13px] font-medium">
            {item.category?.name}
          </span>

          <span className="rounded-full bg-[#D9D9D9] px-3 py-1 text-xs font-medium">
            수량 {qty}개
          </span>
        </div>

        <p className="mt-2 text-[20px] font-extrabold text-[#410F07]">
          {item.name}
        </p>

        <p className="mt-1 text-sm text-[#410F07] line-clamp-2">
          {item.description}
        </p>
      </div>
    </button>
  );
}
