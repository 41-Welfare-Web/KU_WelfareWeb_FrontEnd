import CartContent from "./CartContent";

type Props = {
  items: {
    id: string | number;
    name: string;
    count: number;
    imageUrl?: string;
  }[];
  onGoCheckout: () => void;
};

export default function CartSidebar({ items, onGoCheckout }: Props) {
  return (
    <aside className="sticky top-24 w-[312px] h-[calc(100vh-200px)]">
      <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-[#FFF6EE] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <div className="h-full flex flex-col">
          <CartContent items={items} onGoCheckout={onGoCheckout} />
        </div>
      </div>
    </aside>
  );
}
