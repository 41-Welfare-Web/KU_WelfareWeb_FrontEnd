// RentalConfirmModal 버튼 동작 단위테스트
// - 예약 확정 버튼 활성화 조건: 소속 선택 + 대여 동의 + 품목 존재 + 날짜 설정
// - 소속 선택 버튼(DepartmentPickerModal 연동), 동의 전체보기, 닫기 버튼
// - mode="edit"일 때 editItems 사용 및 payload 검증
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RentalConfirmModal from "../components/Rental/RentalConfirmModal";
import { getMyProfile } from "../services/userApi";
import { getMyCart } from "../api/rental/cart/cartApi";

// ── 외부 의존성 모킹 ──────────────────────────────────────────────
// 주의: 컨텍스트 mock은 렌더마다 "같은 참조"를 반환해야 한다.
// (매 호출마다 새 객체/배열을 만들면 deptGroups를 deps로 쓰는
//  effect가 무한 재실행되어 테스트가 멈춤)

// 인증 컨텍스트: 일반 유저로 고정
vi.mock("../contexts/AuthContext", () => {
  const authValue = {
    isLoggedIn: true,
    user: { id: "u1", username: "user1", name: "홍길동", role: "USER" },
    accessToken: "token",
    refreshToken: "refresh",
    login: () => {},
    logout: async () => {},
    refreshFromStorage: () => {},
    isLoggingOut: false,
  };
  return { useAuth: () => authValue };
});

// 메타데이터 컨텍스트: 소속 그룹 고정 (DepartmentPickerModal도 이 mock을 사용)
vi.mock("../contexts/MetadataContext", () => {
  const metadataValue = {
    deptGroups: [
      { type: "학과", names: ["컴퓨터공학과", "전자공학과"] },
      { type: "동아리", names: [], requiresInput: true },
    ],
    loading: false,
    refresh: async () => {},
  };
  return { useMetadata: () => metadataValue };
});

// 프로필 / 장바구니 API 모킹
vi.mock("../services/userApi", () => ({
  getMyProfile: vi.fn(),
}));
vi.mock("../api/rental/cart/cartApi", () => ({
  getMyCart: vi.fn(),
}));

const mockedGetMyProfile = vi.mocked(getMyProfile);
const mockedGetMyCart = vi.mocked(getMyCart);

// 소속이 비어있는 프로필 (테스트에서 직접 소속을 선택하도록)
const baseProfile = {
  id: "u1",
  username: "user1",
  name: "홍길동",
  studentId: "2020123456",
  phoneNumber: "01012345678",
  departmentType: "",
  departmentName: "",
  role: "USER" as const,
  createdAt: "2026-01-01",
};

// 날짜가 설정된 장바구니 응답 (모달 내부에서 slice(0,10) 처리)
const cartWithDates = {
  items: [
    {
      item: { id: 5, name: "천막" },
      quantity: 2,
      startDate: "2026-07-20T00:00:00.000Z",
      endDate: "2026-07-22T00:00:00.000Z",
    },
  ],
} as any;

function renderModal(props: Record<string, unknown> = {}) {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  render(
    <RentalConfirmModal
      open
      onClose={onClose}
      onSubmit={onSubmit}
      {...props}
    />,
  );

  return { onClose, onSubmit };
}

// 소속 선택 플로우: "선택" 버튼 → 피커에서 소분류 클릭
async function pickDepartment(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "선택" }));
  await user.click(
    await screen.findByRole("button", { name: "컴퓨터공학과" }),
  );
}

// 대여 동의 플로우: "전체보기" → 체크 → "확인"
async function agreeRental(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "전체보기" }));
  await user.click(
    await screen.findByText("위 내용을 확인했으며 동의합니다."),
  );
  await user.click(screen.getByRole("button", { name: "확인" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetMyProfile.mockResolvedValue({ ...baseProfile });
  mockedGetMyCart.mockResolvedValue(cartWithDates);
  // jsdom은 window.scrollTo 미구현 → useLockBodyScroll 정리 단계의 경고 억제
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("RentalConfirmModal — create 모드", () => {
  it("open=false면 아무것도 렌더링하지 않음", () => {
    render(<RentalConfirmModal open={false} onClose={vi.fn()} />);

    expect(screen.queryByText("신청 정보 확인")).not.toBeInTheDocument();
  });

  it("프로필/장바구니 로드 후 정보 표시, 신청 버튼은 초기 비활성", async () => {
    renderModal();

    // 프로필 로드 대기
    expect(await screen.findByDisplayValue("홍길동")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2020123456")).toBeInTheDocument();
    // 장바구니 품목 표시
    expect(await screen.findByText("천막")).toBeInTheDocument();
    // "2개"는 품목 행 + 총 수량 행 두 곳에 표시됨
    expect(screen.getAllByText("2개")).toHaveLength(2);

    // 소속 미선택 + 미동의 → 비활성
    expect(
      screen.getByRole("button", { name: "✓ 위 정보로 신청하기" }),
    ).toBeDisabled();
  });

  it("소속만 선택하면 여전히 비활성 (동의 필요)", async () => {
    const user = userEvent.setup();
    renderModal();
    await screen.findByDisplayValue("홍길동");

    await pickDepartment(user);

    // 선택 결과가 버튼에 반영됨
    expect(
      screen.getByRole("button", { name: "학과 / 컴퓨터공학과" }),
    ).toBeInTheDocument();
    // 동의 전이므로 비활성
    expect(
      screen.getByRole("button", { name: "✓ 위 정보로 신청하기" }),
    ).toBeDisabled();
  });

  it("동의만 하면 여전히 비활성 (소속 필요)", async () => {
    const user = userEvent.setup();
    renderModal();
    await screen.findByDisplayValue("홍길동");
    await screen.findByText("천막");

    await agreeRental(user);

    expect(
      screen.getByRole("button", { name: "✓ 위 정보로 신청하기" }),
    ).toBeDisabled();
  });

  it("소속+동의+품목 모두 충족 시 활성화, 클릭하면 onSubmit에 payload 전달", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();
    await screen.findByDisplayValue("홍길동");
    await screen.findByText("천막");

    await pickDepartment(user);
    await agreeRental(user);

    const submitBtn = screen.getByRole("button", {
      name: "✓ 위 정보로 신청하기",
    });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "create",
        departmentType: "학과",
        departmentName: "컴퓨터공학과",
        cartItems: [
          {
            itemId: 5,
            name: "천막",
            quantity: 2,
            startDate: "2026-07-20",
            endDate: "2026-07-22",
          },
        ],
      }),
    );
  });

  it("장바구니가 비어있으면 소속+동의를 해도 비활성", async () => {
    mockedGetMyCart.mockResolvedValue({ items: [] } as any);
    const user = userEvent.setup();
    renderModal();
    await screen.findByDisplayValue("홍길동");

    expect(
      await screen.findByText("장바구니가 비어있어요."),
    ).toBeInTheDocument();

    await pickDepartment(user);
    await agreeRental(user);

    expect(
      screen.getByRole("button", { name: "✓ 위 정보로 신청하기" }),
    ).toBeDisabled();
  });

  it("날짜 미설정 품목이 있으면 경고 표시 + 비활성", async () => {
    mockedGetMyCart.mockResolvedValue({
      items: [
        {
          item: { id: 5, name: "천막" },
          quantity: 2,
          startDate: null,
          endDate: null,
        },
      ],
    } as any);
    const user = userEvent.setup();
    renderModal();
    await screen.findByDisplayValue("홍길동");
    await screen.findByText("천막");

    await pickDepartment(user);
    await agreeRental(user);

    expect(
      screen.getByText(/대여 기간이 설정되지 않은 물품이 있어요/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "✓ 위 정보로 신청하기" }),
    ).toBeDisabled();
  });

  it("헤더 닫기 버튼 클릭 시 onClose 호출", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await screen.findByDisplayValue("홍길동");

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("RentalConfirmModal — edit 모드", () => {
  const editProps = {
    mode: "edit" as const,
    editRentalId: 77,
    editItems: [
      {
        itemId: 5,
        name: "천막",
        quantity: 3,
        startDate: "2026-07-20",
        endDate: "2026-07-22",
      },
    ],
    initialUserName: "홍길동",
    initialStudentId: "2020123456",
    initialPhoneNumber: "01012345678",
    initialDepartmentType: "학과",
    initialDepartmentName: "컴퓨터공학과",
  };

  it("editItems를 사용하고 getMyCart/getMyProfile을 호출하지 않음", async () => {
    renderModal(editProps);

    // 제목과 CTA가 수정 모드 문구
    expect(screen.getByText("예약 정보 수정")).toBeInTheDocument();
    expect(await screen.findByText("천막")).toBeInTheDocument();
    // "3개"는 품목 행 + 총 수량 행 두 곳에 표시됨
    expect(screen.getAllByText("3개")).toHaveLength(2);

    expect(mockedGetMyCart).not.toHaveBeenCalled();
    expect(mockedGetMyProfile).not.toHaveBeenCalled();
  });

  it("초기 소속이 채워져 있어 동의만 하면 수정 버튼 활성화, payload에 mode/editRentalId 포함", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal(editProps);
    await screen.findByText("천막");

    // 초기 소속이 반영됨
    expect(
      await screen.findByRole("button", { name: "학과 / 컴퓨터공학과" }),
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: "✓ 위 정보로 수정하기",
    });
    expect(submitBtn).toBeDisabled();

    await agreeRental(user);
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "edit",
        editRentalId: 77,
        departmentType: "학과",
        departmentName: "컴퓨터공학과",
        cartItems: editProps.editItems,
      }),
    );
  });
});
