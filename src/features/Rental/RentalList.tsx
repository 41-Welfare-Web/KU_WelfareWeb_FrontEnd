import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Filter, { type Category } from "./components/Filter";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://rentalweb-production.up.railway.app";

export default function RentalList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

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

        {/* 필터 컴포넌트 */}
        <Filter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onChange={setSelectedCategoryId}
        />
      </main>
    </>
  );
}
