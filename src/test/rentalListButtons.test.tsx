// RentalList 버튼 동작 단위테스트
// 무거운 자식 컴포넌트(Header/Footer/ItemDetailModal/CartPanel 등)는 스텁으로 대체하고,
// RentalList 자체의 핸들러(장바구니 담기, 삭제, 체크아웃 이동, 상세 모달 열기)를 검증한다.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RentalList from "../features/Rental/RentalList";
import { getItems, getCategories } from "../api/rental/rentalApi";
import {
  addToCart,
  getMyCart,
  deleteCartItem,
  updateCartItem,
} from "../api/rental/cart/cartApi";

// ── 자식 컴포넌트 스텁 ────────────────────────────────────────────
vi.mock("../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock("../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));
vi.mock("../components/Rental/SortDropdown", () => ({
  default: () => null,
}));
vi.mock("../components/Rental/CategoryFilter", () => ({
  default: () => null,
}));

// 물품 카드: 클릭 시 onClick 호출하는 버튼으로 대체
vi.mock("../components/Rental/ItemCard", () => ({
  default: ({ item, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {item.name}
    </button>
  ),
}));

// 장바구니 패널: 체크아웃/삭제 버튼만 노출
vi.mock("../components/Rental/CartPanel", () => ({
  default: ({ items, onGoCheckout, onRemove }: any) => (
    <div data-testid="cart-panel">
      <button type="button" onClick={onGoCheckout}>
        대여 신청하러 가기
      </button>
      {items.map((it: any) => (
        <button
          key={it.cartId}
          type="button"
          onClick={() => onRemove?.(it.cartId)}
        >
          {`삭제-${it.name}`}
        </button>
      ))}
    </div>
  ),
}));

// 상세 모달: open 상태와 담기 버튼만 재현 (onAddToCart 인자는 RentalList가 소비)
vi.mock("../components/Rental/ItemDetailModal", () => ({
  default: ({ open, itemId, onClose, onAddToCart }: any) =>
    open ? (
      <div data-testid="detail-modal">
        <span>{`상세-${itemId}`}</span>
        <button
          type="button"
          onClick={() =>
            onAddToCart(
              { id: itemId, name: "천막" },
              {
                quantity: 2,
                startDate: "2026-07-20",
                endDate: "2026-07-21",
              },
            )
          }
        >
          장바구니 담기
        </button>
        <button type="button" onClick={onClose}>
          상세 닫기
        </button>
      </div>
    ) : null,
}));

// ── API 모킹 ──────────────────────────────────────────────────────
vi.mock("../api/rental/rentalApi", () => ({
  getItems: vi.fn(),
  getCategories: vi.fn(),
}));
vi.mock("../api/rental/cart/cartApi", () => ({
  addToCart: vi.fn(),
  getMyCart: vi.fn(),
  deleteCartItem: vi.fn(),
  updateCartItem: vi.fn(),
}));

const mockedGetItems = vi.mocked(getItems);
const mockedGetCategories = vi.mocked(getCategories);
const mockedAddToCart = vi.mocked(addToCart);
const mockedGetMyCart = vi.mocked(getMyCart);
const mockedDeleteCartItem = vi.mocked(deleteCartItem);
const mockedUpdateCartItem = vi.mocked(updateCartItem);

// 실제 mapper(toUiCartItems)가 소비하는 서버 응답 형태
const cartResponse = {
  items: [
    {
      id: 11,
      userId: "u1",
      itemId: 1,
      quantity: 2,
      startDate: "2026-07-20T00:00:00.000Z",
      endDate: "2026-07-21T00:00:00.000Z",
      createdAt: "",
      updatedAt: "",
      item: {
        id: 1,
        name: "천막",
        itemCode: "T-01",
        imageUrl: null,
        totalQuantity: 13,
        category: { id: 1, name: "행사" },
      },
    },
  ],
  totalCount: 1,
  hasUnsetDates: false,
} as any;

function renderList() {
  render(
    <MemoryRouter initialEntries={["/rental"]}>
      <Routes>
        <Route path="/rental" element={<RentalList />} />
        <Route path="/rental/cart" element={<div>장바구니 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetItems.mockResolvedValue([{ id: 1, name: "천막" }] as any);
  mockedGetCategories.mockResolvedValue([]);
  mockedGetMyCart.mockResolvedValue(cartResponse);
  mockedAddToCart.mockResolvedValue({ id: 99 } as any);
  mockedUpdateCartItem.mockResolvedValue({} as any);
  mockedDeleteCartItem.mockResolvedValue({ message: "ok" } as any);
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("RentalList — 버튼 동작", () => {
  it("물품 카드 클릭 시 해당 itemId로 상세 모달이 열림", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole("button", { name: "천막" }));

    expect(await screen.findByTestId("detail-modal")).toBeInTheDocument();
    expect(screen.getByText("상세-1")).toBeInTheDocument();
  });

  it("상세 모달 '장바구니 담기' 클릭 시 addToCart→updateCartItem→재조회 후 모달 닫힘", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole("button", { name: "천막" }));
    await user.click(
      await screen.findByRole("button", { name: "장바구니 담기" }),
    );

    await waitFor(() => {
      // 1) 수량과 함께 추가
      expect(mockedAddToCart).toHaveBeenCalledWith({
        itemId: 1,
        quantity: 2,
      });
    });
    // 2) 날짜가 모두 선택되었으므로 PUT으로 날짜 저장
    expect(mockedUpdateCartItem).toHaveBeenCalledWith(99, {
      quantity: 2,
      startDate: "2026-07-20",
      endDate: "2026-07-21",
    });
    // 3) 장바구니 재조회 (초기 1회 + 담기 후 1회)
    await waitFor(() => {
      expect(mockedGetMyCart).toHaveBeenCalledTimes(2);
    });
    // 4) 모달 닫힘
    await waitFor(() => {
      expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();
    });
  });

  it("장바구니 담기 실패 시 alert 표시, 모달은 유지", async () => {
    mockedAddToCart.mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole("button", { name: "천막" }));
    await user.click(
      await screen.findByRole("button", { name: "장바구니 담기" }),
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "장바구니 담기에 실패했어요.",
      );
    });
    expect(screen.getByTestId("detail-modal")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("장바구니 패널의 삭제 버튼 클릭 시 deleteCartItem 호출 후 재조회", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      await screen.findByRole("button", { name: "삭제-천막" }),
    );

    await waitFor(() => {
      expect(mockedDeleteCartItem).toHaveBeenCalledWith(11);
    });
    await waitFor(() => {
      expect(mockedGetMyCart).toHaveBeenCalledTimes(2);
    });
  });

  it("장바구니 삭제 실패 시 alert 표시", async () => {
    mockedDeleteCartItem.mockRejectedValueOnce(new Error("fail"));
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const user = userEvent.setup();
    renderList();

    await user.click(
      await screen.findByRole("button", { name: "삭제-천막" }),
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "장바구니에서 삭제에 실패했어요.",
      );
    });
    consoleSpy.mockRestore();
  });

  it("'대여 신청하러 가기' 클릭 시 /rental/cart로 이동", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      await screen.findByRole("button", { name: "대여 신청하러 가기" }),
    );

    expect(await screen.findByText("장바구니 페이지")).toBeInTheDocument();
  });
});
