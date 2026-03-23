import React from "react";

const FloatingHelpButton: React.FC = () => {
  return (
    <button
      type="button"
      aria-label="도움말"
      title="홈페이지 이용 가이드"
      className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF8A6B] shadow-lg flex items-center justify-center hover:bg-[#E02000] transition-colors"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
      onClick={() => window.open("https://drive.google.com/drive/folders/1mdV8BLxVTucARsHrlGCnLOduXwxcRWXv?usp=sharing", "_blank")}
    >
      <span className="text-white text-3xl font-bold select-none">?</span>
    </button>
  );
};

export default FloatingHelpButton;
