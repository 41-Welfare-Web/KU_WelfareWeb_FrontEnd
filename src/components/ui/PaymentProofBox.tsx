import CardIcon from "../../assets/plotter/card.svg";

interface PaymentProofBoxProps {
  accountInfo: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
  className?: string;
}

export default function PaymentProofBox({
  accountInfo,
  onChange,
  file,
  className = ""
}: PaymentProofBoxProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <img src={CardIcon} alt="Card" className="w-4 h-4" />
        <label className="text-[20px] font-medium text-black">입금 내역 증빙</label>
      </div>
      <div className="bg-[#fff3e5] border border-dashed border-[#99a1af] rounded-[10px] p-6">
        <div className="mb-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-[20px] text-[#606060]">입금 계좌:</span>
            <span className="text-[20px] text-[#f72] font-medium">
              {accountInfo.bank} {accountInfo.accountNumber} ({accountInfo.accountHolder})
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[20px] text-[#606060]">입금자명:</span>
            <span className="text-[20px] text-[#606060]">
              본인 이름으로 입금해주세요.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
            id="receipt-upload"
          />
          <label
            htmlFor="receipt-upload"
            className="inline-block bg-[#fccc96] px-6 py-2 rounded-[19px] text-[15px] text-[#f72] cursor-pointer hover:bg-[#fbb974] font-medium"
          >
            파일 선택
          </label>
          <span className="text-[20px] text-[#bababa]">
            {file ? file.name : "선택된 파일 없음"}
          </span>
        </div>
      </div>
    </div>
  );
}
