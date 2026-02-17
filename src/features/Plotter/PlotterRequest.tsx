import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NoticeBox from "../../components/ui/NoticeBox";
import ApplicationSummary from "../../components/ui/ApplicationSummary";
import FileUploadBox from "../../components/ui/FileUploadBox";
import PaymentProofBox from "../../components/ui/PaymentProofBox";
import PageHeader from "../../components/ui/PageHeader";
import PlotterFormFields from "../../components/ui/PlotterFormFields";

export default function PlotterRequest() {
  const navigate = useNavigate();
  const [studentNo] = useState("202112345");
  const [name] = useState("홍길동");
  const [unit, setUnit] = useState("학생복지위원회");
  const [phone] = useState("010-1234-5678");
  const [purpose, setPurpose] = useState("대자보 출력");
  const [paperSize, setPaperSize] = useState("A1(594 x 941mm)");
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
    if (!purpose.trim()) {
      alert("목적을 입력해 주세요.");
      return;
    }

    // 신청 완료 페이지로 이동 (신청자 정보 전달)
    navigate("/plotter/complete", {
      state: {
        name,
        studentNo,
        phone,
        purpose,
        quantity,
        expectedDate: getExpectedDate(),
      },
    });
  };

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen">
        {/* 타이틀 섹션 */}
        <PageHeader 
          title="플로터 대형 인쇄"
          subtitle="포스터, 현수막 등 대형 출력물을 인쇄해 드립니다."
        />

        {/* 메인 컨텐츠 */}
        <section className="max-w-[1440px] mx-auto px-4 pb-20">
          <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
            {/* 왼쪽: 신청 정보 입력 */}
            <div className="w-full lg:w-[764px] bg-white rounded-[30px] p-8 shadow-lg">
              <PlotterFormFields
                studentNo={studentNo}
                name={name}
                unit={unit}
                onUnitChange={setUnit}
                phone={phone}
                purpose={purpose}
                onPurposeChange={setPurpose}
                paperSize={paperSize}
                onPaperSizeChange={setPaperSize}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />

              {/* PDF 파일 업로드 */}
              <FileUploadBox
                label="인쇄 파일 (PDF)"
                accept=".pdf"
                onChange={handlePdfUpload}
                file={pdfFile}
                helperText="글꼴 깨짐 방지를 위해 PDF 포맷으로 업로드 해주세요"
              />

              {/* 입금 내역 증빙 */}
              <PaymentProofBox
                accountInfo={{
                  bank: "카카오뱅크",
                  accountNumber: "3333-00-1234567",
                  accountHolder: "정근녕"
                }}
                onChange={handleReceiptUpload}
                file={receiptFile}
              />
            </div>

            {/* 오른쪽: 신청 요약 + 유의사항 */}
            <div className="w-full lg:w-[469px] flex flex-col gap-6">
              {/* 신청 요약 */}
              <ApplicationSummary
                paperSize={paperSize}
                quantity={quantity}
                expectedDate={getExpectedDate()}
                isFree={false}
                totalAmount={totalPrice}
                onSubmit={handleSubmit}
              />

              {/* 유의사항 */}
              <NoticeBox
                items={[
                  "출력물은 근무일 기준 2일 이후에 수령할 수 있습니다.",
                  "주말 및 공휴일은 인쇄 작업이 진행되지 않습니다."
                ]}
              />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
