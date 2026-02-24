import CartContent from "./CartContent";

type Props = {
  items: {
    cartId: number;
    itemId: number;
    name: string;
    count: number;
    imageUrl?: string;
  }[];
  onGoCheckout: () => void;
  onRemove?: (cartId: number) => void;
};

export default function CartSidebar({ items, onGoCheckout, onRemove }: Props) {
  return (
    <aside className="sticky mt-15 pb-24 top-[15vh] w-[20vw] min-w-[280px] max-w-[420px] h-[calc(100vh-104px)]">
      <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-[#FFF6EE] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
        <div className="h-full flex flex-col">
          <CartContent
            items={items}
            onGoCheckout={onGoCheckout}
            onRemove={onRemove}
          />
        </div>
      </div>
    </aside>
  );
}
