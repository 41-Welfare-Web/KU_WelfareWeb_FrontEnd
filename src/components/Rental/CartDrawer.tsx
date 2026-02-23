import { useEffect } from "react";
import CartContent from "./CartContent";

type Props = {
  open: boolean;
  onClose: () => void;
  items: {
    id: string | number;
    name: string;
    count: number;
    imageUrl?: string;
  }[];
  onGoCheckout: () => void;
};

export default function CartDrawer({
  open,
  onClose,
  items,
  onGoCheckout,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[280px] max-w-[90vw] transform bg-white shadow-[-10px_0_24px_rgba(0,0,0,0.18)] transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <CartContent
          items={items}
          onGoCheckout={onGoCheckout}
          headerRight={
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-[14px] font-semibold text-[#410F07]"
              aria-label="장바구니 닫기"
            >
              ✕
            </button>
          }
        />
      </div>
    </div>
  );
}
