import React from "react";

interface RejectReasonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectReasonModal({ open, onClose, onSubmit }: RejectReasonModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[350px] pointer-events-auto border border-gray-200">
        <h2 className="text-lg font-bold mb-3 text-center">반려 사유를 입력해주세요</h2>
        <textarea
          className="w-full h-24 border border-gray-300 rounded p-2 mb-4 resize-none focus:outline-none focus:border-blue-500"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="반려 사유를 입력하세요"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 rounded bg-[#fe6949] text-white font-semibold hover:bg-[#e85a3c]"
            onClick={() => {
              if (reason.trim()) {
                onSubmit(reason.trim());
              }
            }}
            disabled={!reason.trim()}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
