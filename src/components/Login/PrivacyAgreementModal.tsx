import cancel from "../../assets/rental/cancel.svg";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PrivacyAgreementModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/45 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[80vh] overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-black">
            개인정보 수집 및 이용 동의
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:opacity-90 transition"
            aria-label="닫기"
          >
            <img src={cancel} alt="닫기" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto max-h-[calc(80vh-72px)] text-[14px] leading-7 text-[#555]">
          <p className="font-bold text-black mb-3">
            개인정보 수집 및 이용 동의 (필수)
          </p>

          <p className="font-semibold text-black mb-2">
            [이용 대상 및 서비스 이용 정책]
          </p>
          <p className="mb-4">
            본 서비스는 건국대학교 소속원에 한하여 가입 및 이용이 가능합니다.
            이용자는 가입 시 본인의 실제 소속 집행부 단위(단과대학, 학과,
            동아리 등)를 정확하게 등록해야 하며, 등록된 소속 단위에 부여된
            권한과 목적에 맞게 서비스를 이용해야 합니다. 허위 정보 등록 시
            서비스 이용이 제한될 수 있습니다.
          </p>

          <p className="font-semibold text-black mb-2">
            [개인정보 수집 및 이용 고지]
          </p>

          <p className="font-semibold text-black">수집 항목 :</p>
          <p className="mb-4">
            성명, 학번, 소속(단과대학/학과), 휴대폰 번호
          </p>

          <p className="font-semibold text-black">수집 목적 :</p>
          <div className="mb-4">
            <p>- 건국대학교 구성원 인증 및 식별</p>
            <p>- 소속 단위별 맞춤형 서비스 제공 및 이용 권한 관리</p>
            <p>- 서비스 관련 공지사항 전달 및 민원 처리</p>
          </div>

          <p className="font-semibold text-black">보유 및 이용 기간 :</p>
          <p className="mb-4">
            회원 탈퇴 시 즉시 파기
            <br />
            (단, 관련 법령 또는 학교 규정에 따라 보존이 필요한 경우 해당
            기간까지 보관)
          </p>

          <p>
            귀하는 본 동의를 거부할 권리가 있으나, 거부 시 회원가입 및 소속
            단위별 특화 서비스 이용이 불가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}