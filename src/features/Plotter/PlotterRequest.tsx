import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function PlotterRequest() {
  const navigate = useNavigate();
  const [studentNo] = useState("202112345");
  const [name] = useState("홍길동");
  const [unit, setUnit] = useState("학생복지위원회");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [paperSize, setPaperSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // 예상 수령일 계산 (근무일 기준 2일 후)
  const getExpectedDate = () => {
    const today = new Date();
    let workDays = 0;
    let current = new Date(today);
    
    while (workDays < 2) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) workDays++;
    }
    
    return `${current.getMonth() + 1}월 ${current.getDate()}일`;
  };

  // 용지 크기에 따른 가격 책정 (예시)
  const getPaperPrice = () => {
    if (paperSize.includes("A1")) return 5000;
    if (paperSize.includes("A2")) return 3000;
    if (paperSize.includes("A3")) return 2000;
    return 0;
  };

  const totalPrice = getPaperPrice() * quantity;

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!paperSize) {
      alert("용지 크기를 선택해 주세요.");
      return;
    }
    if (!pdfFile) {
      alert("PDF 파일을 업로드해 주세요.");
      return;
    }
    if (!receiptFile) {
      alert("입금 내역 증빙 파일을 올려주세요.");
      return;
    }
    if (!phone.trim() || !purpose.trim()) {
      alert("모든 정보를 입력해 주세요.");
      return;
    }

    // 신청 완료 페이지로 이동 (신청자 정보 전달)
    navigate("/plotter/complete", {
      state: {
        name,
        studentNo,
        phone,
      },
    });
  };

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen">
        {/* 타이틀 섹션 */}
        <section className="w-full pt-12 pb-8 px-4">
          <div className="max-w-[1440px] mx-auto text-center">
            <h1 className="text-[48px] font-extrabold text-black mb-4">
              플로터 대형 인쇄
            </h1>
            <p className="text-[28px] text-[#6a7282]">
              포스터, 현수막 등 대형 출력물을 인쇄해 드립니다.
            </p>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <section className="max-w-[1440px] mx-auto px-4 pb-20">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* 왼쪽: 신청 정보 입력 */}
            <div className="flex-1 bg-white rounded-[30px] p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <svg className="w-9 h-9 text-[#FE6949]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <h2 className="text-[32px] font-bold text-[#410f07]">신청 정보 입력</h2>
              </div>

              {/* 학번 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">학번</label>
                <input
                  type="text"
                  value={studentNo}
                  disabled
                  className="w-full h-[71px] px-6 rounded-[10px] border border-[#8e8e8e] bg-[#a2a2a2] text-[#666] text-[20px]"
                />
              </div>

              {/* 이름 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">이름</label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[#666] text-[20px]"
                />
              </div>

              {/* 소속 단위 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">소속 단위</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px] appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                >
                  <option>학생복지위원회</option>
                  <option>총학생회</option>
                  <option>동아리연합회</option>
                </select>
              </div>

              {/* 전화번호 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-[#a2a2a2] text-[20px] placeholder:text-[#666]"
                />
              </div>

              {/* 목적 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">목적</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="ex) 개인 과제, 부착용"
                  className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-[20px] placeholder:text-[#b1b1b1]"
                />
              </div>

              {/* 용지 크기 & 인쇄 장수 */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-[20px] font-medium text-black mb-2">용지 크기</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px] appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                  >
                    <option value="">용지를 선택하세요</option>
                    <option value="A1(594 x 941mm)">A1(594 x 941mm)</option>
                    <option value="A2(420 x 594mm)">A2(420 x 594mm)</option>
                    <option value="A3(297 x 420mm)">A3(297 x 420mm)</option>
                  </select>
                </div>
                <div className="w-[268px]">
                  <label className="block text-[20px] font-medium text-black mb-2">인쇄 장수</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full h-[71px] px-6 rounded-[10px] border border-[#99a1af] bg-white text-black text-[20px]"
                    />
                    <span className="text-[35px] font-medium">장</span>
                  </div>
                </div>
              </div>

              {/* PDF 파일 업로드 */}
              <div className="mb-6">
                <label className="block text-[20px] font-medium text-black mb-2">인쇄 파일 (PDF)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center w-full h-[145px] border border-dashed border-[#99a1af] rounded-[10px] bg-white cursor-pointer hover:bg-gray-50"
                  >
                    <svg className="w-[43px] h-[43px] text-gray-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                    </svg>
                    <p className="text-[15px] text-[#868686]">
                      {pdfFile ? pdfFile.name : "PDF 파일을 이곳에 드래그 하거나 클릭하세요"}
                    </p>
                  </label>
                </div>
                <p className="text-[15px] text-[#b1b1b1] mt-2 ml-1">
                  • 글꼴 깨짐 방지를 위해 PDF 포맷으로 업로드 해주세요
                </p>
              </div>

              {/* 입금 내역 증빙 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                  </svg>
                  <label className="text-[20px] font-medium text-black">입금 내역 증빙</label>
                </div>
                <div className="bg-[#fff3e5] border border-dashed border-[#99a1af] rounded-[10px] p-6">
                  <div className="mb-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[20px] text-[#606060]">입금 계좌:</span>
                      <span className="text-[20px] text-[#f72] font-medium">
                        카카오뱅크 3333-00-1234567 (정근녕)
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
                      onChange={handleReceiptUpload}
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
                      {receiptFile ? receiptFile.name : "선택된 파일 없음"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 신청 요약 + 유의사항 */}
            <div className="w-full lg:w-[469px] flex flex-col gap-6">
              {/* 신청 요약 */}
              <div className="bg-white rounded-[30px] p-8 shadow-lg">
                <h2 className="text-[32px] font-bold text-[#410f07] mb-8">신청 요약</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[20px] text-[#606060]">용지/수량</span>
                    <span className="text-[20px] text-[#606060]">
                      {paperSize ? `${paperSize.split('(')[0]}/${quantity}장` : "용지를 선택하세요"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[20px] text-[#606060]">수령 예정일</span>
                    <span className="text-[20px] text-[#f72] font-medium">{getExpectedDate()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[20px] text-[#606060]">비용 구분</span>
                    <span className="inline-block bg-[#d9d9d9] px-4 py-1 rounded-[5px] text-[12px]">
                      유료 결제
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[20px] text-[#606060]">총 결제금액</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[32px] font-medium text-[#410f07]">
                        {totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[20px] text-[#606060]">원</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full h-[63px] bg-[#f72] rounded-[10px] shadow-lg text-white text-[24px] font-bold hover:bg-[#e65a3d] transition"
                >
                  신청하기
                </button>
              </div>

              {/* 유의사항 */}
              <div className="bg-[#ffe57d] rounded-[30px] p-8">
                <h3 className="text-[20px] font-medium text-black mb-4">유의사항</h3>
                <div className="text-[15px] text-[#606060] space-y-1">
                  <p>출력물은 근무일 기준 2일 이후에 수령할 수 있습니다.</p>
                  <p>주말 및 공휴일은 인쇄 작업이 진행되지 않습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
