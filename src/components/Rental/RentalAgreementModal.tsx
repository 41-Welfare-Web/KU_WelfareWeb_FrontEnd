import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

export default function RentalAgreementModal({
  open,
  agreed,
  onAgreeChange,
  onClose,
}: {
  open: boolean;
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
  onClose: () => void;
}) {
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
      <div className="w-[min(760px,94vw)] max-h-[86dvh] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 sm:px-7 py-4">
          <h2 className="text-[20px] sm:text-[28px] font-bold text-black">
            대여 이용 동의
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-[32px] leading-none text-black/50 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(86dvh-210px)] overflow-y-auto px-5 sm:px-7 py-5 text-[15px] sm:text-[18px] leading-[1.8] text-black/70">
          <p className="font-bold text-black">
            1. 지연 반납에 따른 이용 제한 및 신청 단위 제한 동의
          </p>

          <p className="mt-3">
            대여 물품을 정해진 반납 기한 내에 반납하지 않을 경우, 아래의 기준에
            따라 향후 학생복지위원회 서비스(중앙대여사업 및 플로터 인쇄사업 등)
            이용이 제한됨에 동의합니다. 이때 이용 제한은 개인 및 해당 신청
            단위를 기준으로 적용됨을 확인합니다.
          </p>

          <div className="mt-4 space-y-1">
            <p>- 1일 연체 시: 반납일로부터 3개월간 이용 제한</p>
            <p>- 2일 이상 연체 시: 반납일로부터 6개월간 이용 제한</p>
          </div>

          <p className="mt-4">
            (연체 일수 계산에는 주말 및 공휴일이 모두 포함됩니다.)
          </p>

          <hr className="my-6 border-black/10" />

          <p className="font-bold text-black">
            2. 물품 파손 및 분실 시 배상 책임 동의
          </p>

          <p className="mt-3">
            대여 이후 사용자 과실로 인한 고장, 파손, 분실 등 불량 상태로
            반납되어 A/S 수리나 재구매가 필요할 경우, 이에 발생하는 비용
            전액(100%)을 배상할 것을 서약합니다.
          </p>
        </div>

        <div className="border-t border-black/10 px-5 sm:px-7 py-4">
          <label className="flex items-center gap-2 text-[14px] sm:text-[16px] font-semibold text-black cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreeChange(e.target.checked)}
              className="hidden peer"
            />
            <div className="w-4 h-4 rounded-sm border border-gray-300 flex items-center justify-center peer-checked:bg-[#FD7D5D] peer-checked:border-[#FD7D5D]">
              {agreed && (
                <svg
                  viewBox="0 0 20 20"
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10.5L8 14.5L16 5.5" />
                </svg>
              )}
            </div>
            위 내용을 확인했으며 동의합니다.
          </label>

          <button
            type="button"
            onClick={onClose}
            disabled={!agreed}
            className={`mt-4 h-12 w-full rounded-xl text-[16px] font-bold text-white transition ${
              agreed
                ? "bg-[#FD7D5D] hover:bg-[#f26f4d]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
