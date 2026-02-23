import { useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import CartSidebar from "./CartSidebar";
import CartDrawer from "./CartDrawer";

type CartItem = {
  id: string | number;
  name: string;
  count: number;
  imageUrl?: string;
};

type Props = {
  items: CartItem[];
  onGoCheckout: () => void;
};

export default function CartPanel({ items, onGoCheckout }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);

  if (isDesktop) {
    return <CartSidebar items={items} onGoCheckout={onGoCheckout} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-[#FE6949] px-4 py-3 text-[14px] font-semibold text-white shadow-lg"
      >
        장바구니 ({items.length})
      </button>

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onGoCheckout={() => {
          setOpen(false);
          onGoCheckout();
        }}
      />
    </>
  );
}
