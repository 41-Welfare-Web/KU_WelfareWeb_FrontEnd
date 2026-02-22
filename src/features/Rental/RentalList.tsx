import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Filter, { type Category } from "../../components/Rental/Filter";
import ItemCard from "../../components/Rental/ItemCard";
import searchImg from "../../assets/rental/search.svg";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export type Item = {
  id: number;
  category: { id: number; name: string };
  categoryId: number;

  name: string;
  description: string | null;

  itemCode: string;
  rentalCount: number;

  imageUrl: string | null;

  managementType: "INDIVIDUAL" | "BULK";
  totalQuantity: number;
  currentStock: number;

  createdAt: string;
};

type ItemsQuery = {
  search?: string;
  categoryIds?: string;
};

function buildQuery(params: ItemsQuery) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (!v) return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default function RentalList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [items, setItems] = useState<Item[]>([]);
  const [, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  const category_ids = useMemo(() => {
    if (selectedCategoryId == null) return undefined;
    return String(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      setItemsError(null);

      try {
        const qs = buildQuery({
          search: search.trim() || undefined,
          categoryIds: category_ids,
        });

        const res = await fetch(`${API_BASE_URL}/api/items${qs}`);
        if (!res.ok) throw new Error("목록 요청 실패");

        const data = (await res.json()) as Item[];
        console.log("items raw:", data); // 👈 여기 추가

        setItems(data);
      } catch (e: any) {
        setItemsError(e?.message ?? "물품 목록을 불러오지 못했어요.");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [category_ids, search]);

  return (
    <>
      <Header />

      <main className="min-h-[calc(100dvh-80px)] overflow-y-auto bg-[linear-gradient(180deg,_#FFDCC5_0.33%,_#FFEDE2_57.71%,_#FFFFFF_99.63%)]">
        {/* 타이틀 */}
        <div className="px-6 pt-12 md:ml-16 md:mt-5 md:px-0">
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

        <div className="flex flex-row justify-between items-center">
          {/* 필터 컴포넌트 */}
          <Filter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onChange={setSelectedCategoryId}
          />

          {/* 검색 */}
          <div className="px-6 md:mr-16 md:px-0 mt-4">
            <div className="w-full max-w-[420px] bg-white rounded-[11px] px-4 py-3 flex items-center gap-2 border border-black/10">
              <img src={searchImg} alt="검색" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="물품 검색"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <section className="px-6 md:ml-16 md:px-0 mt-6 pb-16">
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
    </>
  );
}
