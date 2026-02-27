import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NoticeBox from "../../components/ui/NoticeBox";
import ApplicationSummary from "../../components/Rental/ApplicationSummary";
import FileUploadBox from "../../components/ui/FileUploadBox";
import PaymentProofBox from "../../components/ui/PaymentProofBox";
import PageHeader from "../../components/ui/PageHeader";
import PlotterFormFields from "../../components/Plotter/PlotterFormFields";
import { createPlotterOrder } from "../../services/plotterApi";
import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile } from "../../services/userApi";
import { getCommonMetadata } from "../../services/commonApi";
import { getExpectedDateKorean } from "../../utils/dateUtils";

interface Purpose {
  id: number;
  name: string;
}

export default function PlotterRequest() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [departmentType, setDepartmentType] = useState("학생복지위원회");
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [purpose, setPurpose] = useState("대자보 출력");
  const [paperSize, setPaperSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("010-0000-0000");
  const [studentId, setStudentId] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 사용자 프로필 로드 (전화번호 가져오기)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) return;
      
      try {
        const profile = await getMyProfile();
        setPhoneNumber(profile.phoneNumber || "010-0000-0000");
        setStudentId(profile.studentId || "");
        // 프로필의 소속 단위로 초기값 설정
        if (profile.departmentType) {
          setDepartmentType(profile.departmentType);
        }
        if (profile.departmentName) {
          setDepartmentName(profile.departmentName);
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  // 목적 목록 로드
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await getCommonMetadata();
        
        // 목적 설정 (데이터가 없으면 빈 배열)
        if (metadata.plotterPurposes) {
          setPurposes(metadata.plotterPurposes);
        }
      } catch (error) {
        console.error("메타데이터 로드 실패:", error);
        // 에러 시 빈 배열 유지
      }
    };

    fetchMetadata();
  }, []);

  // 로그인 안되어 있거나 프로필 로딩 중이면 null 반환 (빈 화면)
  if (!isLoggedIn || !user || isLoadingProfile) {
    return null;
  }

  // 용지 크기에 따른 가격 책정 (예시)
  const getPaperPrice = () => {
    if (paperSize.includes("A1")) return 5000;
    if (paperSize.includes("A2")) return 3000;
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

  const handleSubmit = async () => {
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

    setIsSubmitting(true);

    try {
      // 용지 크기에서 실제 값 추출 (예: "A1(594 x 941mm)" -> "A1")
      const extractedPaperSize = paperSize.split("(")[0].trim();
      
      // API 호출
      const response = await createPlotterOrder({
        purpose: purpose.trim(),
        paperSize: extractedPaperSize,
        pageCount: quantity,
        departmentType,
        departmentName: departmentName || undefined,
        pdfFile,
        paymentReceiptImage: receiptFile || undefined,
      });

      // 신청 완료 페이지로 이동 (응답 데이터 전달)
      navigate("/plotter/complete", {
        state: {
          orderId: response.id,
          name: response.user?.name || user?.name || "",
          studentNo: response.user?.studentId || "",
          phone: phoneNumber,
          purpose: response.purpose,
          quantity: response.pageCount,
          paperSize: response.paperSize,
          expectedDate: response.pickupDate,
          price: response.price,
          status: response.status,
        },
      });
    } catch (error) {
      console.error("플로터 주문 신청 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "플로터 주문 신청에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                studentNo={studentId || ""}
                name={user?.name || ""}
                departmentType={departmentType}
                departmentName={departmentName}
                onDepartmentChange={(type, name) => {
                  setDepartmentType(type);
                  setDepartmentName(name);
                }}
                phone={phoneNumber}
                purpose={purpose}
                purposes={purposes}
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
                expectedDate={getExpectedDateKorean(2)}
                isFree={false}
                totalAmount={totalPrice}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
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
