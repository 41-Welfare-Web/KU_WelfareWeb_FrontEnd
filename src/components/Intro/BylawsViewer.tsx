import { useEffect, useState } from "react";

/**
 * 회칙 PDF 뷰어
 *
 * PDF는 `public/docs/` 에 두고 정적 파일로 서빙합니다.
 * 회칙이 개정되면 **같은 이름으로 파일만 교체**하면 화면도 함께 바뀝니다 (코드 수정 불필요).
 */
const BYLAWS_PDF = "/docs/welfare-bylaws.pdf";
const DOWNLOAD_NAME = "건국대학교 학생복지위원회 회칙.pdf";

type LoadState = "checking" | "ready" | "missing";

export default function BylawsViewer() {
  const [state, setState] = useState<LoadState>("checking");

  // 파일이 없으면 서버 설정상 index.html이 대신 내려와 iframe 안에 사이트가 다시 뜹니다.
  // 그 꼴을 보이지 않도록 먼저 PDF가 맞는지 확인합니다.
  useEffect(() => {
    let alive = true;
    fetch(BYLAWS_PDF, { method: "HEAD" })
      .then((res) => {
        const isPdf =
          res.ok && (res.headers.get("content-type") ?? "").includes("pdf");
        if (alive) setState(isPdf ? "ready" : "missing");
      })
      .catch(() => {
        if (alive) setState("missing");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-[34px] sm:text-4xl md:text-5xl font-bold text-black">
            회칙
          </h2>
          <p className="mt-2 text-[14px] sm:text-[15px] text-[#8E8E8E]">
            건국대학교 학생복지위원회 회칙 전문입니다.
          </p>
        </div>

        {state === "ready" && (
          /* 모바일에는 아래 안내 카드에 같은 버튼이 있어 여기서는 숨김 */
          <div className="hidden md:flex flex-wrap gap-2 shrink-0">
            <a
              href={BYLAWS_PDF}
              download={DOWNLOAD_NAME}
              className="inline-flex items-center gap-2 h-[42px] px-4 rounded-[10px] bg-[#FE6949] text-white font-medium text-[14px] sm:text-[15px] shadow-sm hover:bg-[#e85a3c] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 1.5v8m0 0 3-3m-3 3-3-3M2.5 11v2a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              PDF 다운로드
            </a>
            <a
              href={BYLAWS_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[42px] px-4 rounded-[10px] border border-[#D9D9D9] bg-white text-[#410f07] font-medium text-[14px] sm:text-[15px] hover:bg-[#FFF5F2] hover:border-[#FE6949] transition-colors"
            >
              새 탭에서 열기
            </a>
          </div>
        )}
      </div>

      {state === "checking" && (
        <div className="h-[200px] flex items-center justify-center rounded-2xl border border-[#EDEDED] bg-[#FAFAFA]">
          <span className="text-[#8E8E8E] text-[15px]">회칙을 불러오는 중...</span>
        </div>
      )}

      {state === "missing" && (
        <div className="rounded-2xl border border-[#FFD9CC] bg-[#FFF6F3] px-6 py-10 text-center">
          <p className="text-[16px] sm:text-[17px] font-medium text-[#410f07]">
            회칙 파일을 준비 중입니다.
          </p>
          <p className="mt-2 text-[14px] text-[#8E8E8E]">
            잠시 후 다시 확인해 주세요.
          </p>
        </div>
      )}

      {state === "ready" && (
        <>
          {/* 데스크톱: 브라우저 기본 PDF 뷰어로 바로 보기 */}
          <div className="hidden md:block rounded-2xl overflow-hidden border border-[#D9D9D9] bg-[#F4F4F4]">
            <iframe
              src={`${BYLAWS_PDF}#view=FitH`}
              title="학생복지위원회 회칙"
              className="w-full h-[70vh] min-h-[520px]"
            />
          </div>

          {/* 모바일: PDF 임베드를 지원하지 않는 브라우저가 많아 안내로 대체 */}
          <div className="md:hidden rounded-2xl border border-[#D9D9D9] bg-[#FAFAFA] px-5 py-8 text-center">
            <p className="text-[15px] text-[#410f07] font-medium">
              모바일에서는 바로 보기가 지원되지 않습니다.
            </p>
            <p className="mt-1.5 text-[13px] text-[#8E8E8E]">
              아래 버튼으로 회칙을 확인해 주세요.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={BYLAWS_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[44px] flex items-center justify-center rounded-[10px] bg-[#FE6949] text-white font-medium text-[15px]"
              >
                회칙 보기
              </a>
              <a
                href={BYLAWS_PDF}
                download={DOWNLOAD_NAME}
                className="h-[44px] flex items-center justify-center rounded-[10px] border border-[#D9D9D9] bg-white text-[#410f07] font-medium text-[15px]"
              >
                PDF 다운로드
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
