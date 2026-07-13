// RentalCartItemRow 버튼 동작 단위테스트
// - 수량 증가/감소 버튼, 수량 직접 입력(blur/Enter), 삭제 버튼, 행 클릭 선택
// - locked 품목(RENTED 등)의 제한 동작 검증
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RentalCartItemRow, {
  type RentalCartRowItem,
} from "../components/Rental/RentalCartItemRow";

// 기본 테스트용 품목 생성 헬퍼
function makeItem(overrides: Partial<RentalCartRowItem> = {}): RentalCartRowItem {
  return {
    cartId: 1,
    itemId: 10,
    name: "천막",
    categoryName: "행사",
    count: 3,
    totalQuantity: 13,
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    ...overrides,
  };
}

// 렌더링 헬퍼: 핸들러 mock과 함께 렌더
function setup(overrides: Partial<RentalCartRowItem> = {}) {
  const onSelect = vi.fn();
  const onRemove = vi.fn();
  const onChangeQty = vi.fn();

  render(
    <RentalCartItemRow
      item={makeItem(overrides)}
      status="OK"
      onSelect={onSelect}
      onRemove={onRemove}
      onChangeQty={onChangeQty}
    />,
  );

  return { onSelect, onRemove, onChangeQty };
}

describe("RentalCartItemRow — 일반 품목", () => {
  it("+ 버튼 클릭 시 onChangeQty(count + 1) 호출", async () => {
    const user = userEvent.setup();
    const { onChangeQty, onSelect } = setup({ count: 3 });

    await user.click(screen.getByRole("button", { name: "수량 증가" }));

    expect(onChangeQty).toHaveBeenCalledWith(4);
    // stopPropagation으로 행 선택은 발생하지 않아야 함
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("- 버튼 클릭 시 onChangeQty(count - 1) 호출", async () => {
    const user = userEvent.setup();
    const { onChangeQty, onSelect } = setup({ count: 3 });

    await user.click(screen.getByRole("button", { name: "수량 감소" }));

    expect(onChangeQty).toHaveBeenCalledWith(2);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("수량이 1이면 - 버튼이 disabled", () => {
    setup({ count: 1 });

    expect(screen.getByRole("button", { name: "수량 감소" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "수량 증가" })).toBeEnabled();
  });

  it("수량이 totalQuantity(최대)면 + 버튼이 disabled", () => {
    setup({ count: 13, totalQuantity: 13 });

    expect(screen.getByRole("button", { name: "수량 증가" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "수량 감소" })).toBeEnabled();
  });

  it("수량 직접 입력 후 blur 시 onChangeQty 호출", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.type(input, "5");
    await user.tab(); // blur

    expect(onChangeQty).toHaveBeenCalledWith(5);
  });

  it("수량 입력 후 Enter 시 onChangeQty 호출", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.type(input, "7{Enter}");

    expect(onChangeQty).toHaveBeenCalledWith(7);
  });

  it("최대 수량보다 큰 값 입력 시 totalQuantity로 클램프", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3, totalQuantity: 13 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.type(input, "99");
    await user.tab();

    expect(onChangeQty).toHaveBeenCalledWith(13);
  });

  it("빈 값으로 blur 시 1로 보정", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.tab();

    expect(onChangeQty).toHaveBeenCalledWith(1);
  });

  it("숫자가 아닌 문자는 입력이 무시됨", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.type(input, "2a"); // 'a'는 무시되어 "2"만 남음

    expect(input).toHaveValue("2");

    await user.tab();
    expect(onChangeQty).toHaveBeenCalledWith(2);
  });

  it("현재 수량과 같은 값 입력 시 onChangeQty 미호출", async () => {
    const user = userEvent.setup();
    const { onChangeQty } = setup({ count: 3 });

    const input = screen.getByRole("textbox", { name: "수량 입력" });
    await user.clear(input);
    await user.type(input, "3{Enter}");

    expect(onChangeQty).not.toHaveBeenCalled();
  });

  it("삭제(X) 버튼 클릭 시 onRemove 호출, onSelect는 미호출", async () => {
    const user = userEvent.setup();
    const { onRemove, onSelect } = setup();

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("행 클릭 시 onSelect 호출", async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();

    // 행 자체가 role="button"이며 품목명을 포함
    await user.click(screen.getByText("천막"));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("수량 입력창 클릭 시 onSelect 미호출 (stopPropagation)", async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();

    await user.click(screen.getByRole("textbox", { name: "수량 입력" }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("RentalCartItemRow — locked 품목 (대여중 등)", () => {
  it("삭제 버튼이 렌더링되지 않음", () => {
    setup({ locked: true, itemStatus: "RENTED" });

    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it("+/- 버튼이 모두 disabled", () => {
    setup({ locked: true, itemStatus: "RENTED", count: 3 });

    expect(screen.getByRole("button", { name: "수량 증가" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "수량 감소" })).toBeDisabled();
  });

  it("수량 입력창이 readOnly", () => {
    setup({ locked: true, itemStatus: "RENTED" });

    expect(screen.getByRole("textbox", { name: "수량 입력" })).toHaveAttribute(
      "readonly",
    );
  });

  it('itemStatus가 RENTED면 "대여중 — 날짜만 변경" 배지 표시', () => {
    setup({ locked: true, itemStatus: "RENTED" });

    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "SPAN" && el.textContent === "대여중 — 날짜만 변경",
      ),
    ).toBeInTheDocument();
  });

  it('알 수 없는 itemStatus면 "수정 제한 — 날짜만 변경" 배지 표시', () => {
    setup({ locked: true, itemStatus: "UNKNOWN_STATUS" });

    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "SPAN" && el.textContent === "수정 제한 — 날짜만 변경",
      ),
    ).toBeInTheDocument();
  });

  it("locked여도 행 클릭(onSelect)은 동작함 (날짜 변경용)", async () => {
    const user = userEvent.setup();
    const { onSelect } = setup({ locked: true, itemStatus: "RENTED" });

    await user.click(screen.getByText("천막"));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
