import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { type Category } from "../../api/rental/types";
import ItemCard from "../../components/Rental/ItemCard";
import CartPanel from "../../components/Rental/CartPanel";
import Footer from "../../components/Footer";

import searchImg from "../../assets/rental/search.svg";
import type { Item } from "../../api/rental/types";

import type { SortBy, SortOrder } from "../../api/rental/types";
import SortDropdown from "../../components/Rental/SortDropdown";
import CategoryFilter from "../../components/Rental/CategoryFilter";
import { getItems, getCategories } from "../../api/rental/rentalApi";

// 물품 세부사항
import ItemDetailModal from "../../components/Rental/ItemDetailModal";

// 장바구니
import {
  addToCart,
  getMyCart,
  deleteCartItem,
  updateCartItem,
} from "../../api/rental/cart/cartApi";
import { toUiCartItems } from "../../api/rental/cart/mapper";
import type { UiCartItem } from "../../api/rental/cart/types";

export default function RentalList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [items, setItems] = useState<Item[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 물품 세부사항
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const openDetail = (id: number) => {
    setDetailItemId(id);
    setDetailOpen(true);
  };

  // 장바구니
  const [cartItems, setCartItems] = useState<UiCartItem[]>([]);
  const [, setCartLoading] = useState(false);

  const fetchCart = async () => {
    const data = await getMyCart();
    setCartItems(toUiCartItems(data));
  };

  const handleRemoveCartItem = async (cartId: number) => {
    try {
      await deleteCartItem(cartId);
      await fetchCart();
    } catch (e) {
      console.error("장바구니 삭제 실패:", e);
      alert("장바구니에서 삭제에 실패했어요.");
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setCartLoading(true);
        await fetchCart();
      } catch (e) {
        console.error("장바구니 불러오기 실패:", e);
      } finally {
        setCartLoading(false);
      }
    };
    run();
  }, []);

  // 카테고리(분류) 목록 조회
  useEffect(() => {
    const run = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    run();
  }, []);

  const category_ids = useMemo(() => {
    if (selectedCategoryId == null) return undefined;
    return String(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems({
          search: search.trim() || undefined,
          categoryIds: category_ids,
          sortBy: sortBy ?? undefined,
          sortOrder: sortBy ? sortOrder : undefined,
        });
        setItems(data);
      } catch (e: any) {
        setItemsError(e?.message ?? "물품 목록을 불러오지 못했어요.");
      }
    };
    fetchItems();
  }, [category_ids, search, sortBy, sortOrder]);

  const goCheckout = () => {
    navigate("/rental/cart");
  };

  return (
    <>
      <Header />

      <div className="min-h-[calc(100dvh-80px)] bg-[linear-gradient(180deg,_#FFDCC5_0.33%,_#FFEDE2_57.71%,_#FFFFFF_99.63%)]">
        <div className="mx-auto flex gap-6 px-0 md:px-6">
          {/* 메인 */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            {/* 타이틀 */}
            <div className="px-6 pt-12 md:mt-5 md:px-0">
              <p
                className="text-3xl md:text-[36px] font-bold"
                style={{ textShadow: "0 3px 4px rgba(0,0,0,0.25)" }}
              >
                물품 대여
              </p>
              <p
                className="mt-2 text-base md:text-[20px]"
                style={{ textShadow: "0 3px 4px rgba(0,0,0,0.25)" }}
              >
                필요한 물품을 예약하고 이용하세요.
              </p>
            </div>

            <div className="my-6 px-6 md:px-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              {/* 검색 */}
              <div className="order-1 md:order-2 w-full md:w-auto">
                <div className="w-full md:w-[420px] bg-white rounded-[11px] px-4 py-2.5 flex items-center gap-2 border border-black/10">
                  <img src={searchImg} alt="검색" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="물품 검색"
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>

              {/* 정렬+카테고리 */}
              <div className="order-2 md:order-1 min-w-0 flex items-center gap-3">
                <div className="shrink-0">
                  <SortDropdown
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onChange={({ sortBy, sortOrder }) => {
                      setSortBy(sortBy);
                      setSortOrder(sortOrder);
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 overflow-x-auto scrollbar-hide">
                  <div className="w-max">
                    <CategoryFilter
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onChange={setSelectedCategoryId}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 물품 목록 */}
            <section className="px-6 md:px-0 mt-6 pb-24">
              {itemsError && (
                <div className="mb-4 rounded-xl bg-white/70 border border-red-300 p-4 text-sm">
                  {itemsError}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => openDetail(item.id)}
                  />
                ))}
              </div>
            </section>
          </main>

          <CartPanel
            items={cartItems}
            onGoCheckout={goCheckout}
            onRemove={handleRemoveCartItem}
          />
        </div>

        <ItemDetailModal
          open={detailOpen}
          itemId={detailItemId}
          onClose={() => setDetailOpen(false)}
          onAddToCart={async (item, picked) => {
            try {
              // 1) POST: 장바구니 추가 (수량 포함)
              const added = await addToCart({
                itemId: item.id,
                quantity: picked.quantity,
              });

              // 2) PUT: 날짜까지 저장 (둘 다 선택된 경우만)
              if (picked.startDate && picked.endDate) {
                await updateCartItem(added.id, {
                  quantity: picked.quantity,
                  startDate: picked.startDate,
                  endDate: picked.endDate,
                });
              }

              // 3) 다시 조회해서 패널 갱신
              await fetchCart();
              setDetailOpen(false);
            } catch (e) {
              console.error("장바구니 담기 실패:", e);
              alert("장바구니 담기에 실패했어요.");
            }
          }}
        />
      </div>

      <Footer />
    </>
  );
}
