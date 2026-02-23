import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { type Category } from "../../api/rental/types";
import ItemCard from "../../components/Rental/ItemCard";
import CartPanel from "../../components/Rental/CartPanel";
import Footer from "../../components/Footer";

import searchImg from "../../assets/rental/search.svg";
import exampleImg from "../../assets/rental/exampleImg.svg";
import type { Item } from "../../api/rental/types";

import type { SortBy, SortOrder } from "../../api/rental/types";
import SortDropdown from "../../components/Rental/SortDropdown";
import CategoryFilter from "../../components/Rental/CategoryFilter";
import { getItems, getCategories } from "../../api/rental/rentalApi";

export default function RentalList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [items, setItems] = useState<Item[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 장바구니 UI (서버 연동 전)
  const [cartItems] = useState<
    { id: number; name: string; count: number; imageUrl?: string }[]
  >([{ id: 1, name: "행사용 천막", count: 1, imageUrl: exampleImg }]);

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
    // TODO: navigate("/rental/apply") 이런 식으로 연결
    alert("대여 신청 페이지로 이동!");
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
                className="text-2xl md:text-[36px] font-bold"
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
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </main>

          <CartPanel items={cartItems} onGoCheckout={goCheckout} />
        </div>
      </div>

      <Footer />
    </>
  );
}
