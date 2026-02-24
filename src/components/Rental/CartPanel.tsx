import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import CartSidebar from "./CartSidebar";
import CartDrawer from "./CartDrawer";
import popCart from "../../assets/rental/popCart.svg";

type CartItem = {
  cartId: number;
  itemId: number;
  name: string;
  count: number;
  imageUrl?: string;
};

type Props = {
  items: CartItem[];
  onGoCheckout: () => void;
  onRemove?: (cartId: number) => void;
};

export default function CartPanel({ items, onGoCheckout, onRemove }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [open, setOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  if (isDesktop) {
    return (
      <CartSidebar
        items={items}
        onGoCheckout={onGoCheckout}
        onRemove={onRemove}
      />
    );
  }

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed w-14 h-14 bottom-5 right-5 z-50 rounded-full bg-[#F72] p-3 shadow-lg"
      >
        <img src={popCart} alt="장바구니" />

        {totalCount > 0 && (
          <span
            className="
              absolute 
              -top-1 -right-1
              min-w-[20px] h-[20px]
              px-1
              flex items-center justify-center
              rounded-full
              bg-[#FE6949]
              text-white text-[12px] font-bold
            "
          >
            {isLoggedIn ? totalCount : 0}
          </span>
        )}
      </button>

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onGoCheckout={() => {
          setOpen(false);
          onGoCheckout();
        }}
        onRemove={onRemove}
      />
    </>
  );
}
