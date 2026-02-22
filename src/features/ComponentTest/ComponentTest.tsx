import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// 플로터 관련 컴포넌트
import ApplicationSummary from "../../components/Rental/ApplicationSummary";
import FileUploadBox from "../../components/ui/FileUploadBox";
import PaymentProofBox from "../../components/ui/PaymentProofBox";
import PlotterFormFields from "../../components/Plotter/PlotterFormFields";
import PlotterRequestSummary from "../../components/Plotter/PlotterRequestSummary";
import StatusBadge from "../../components/ui/StatusBadge";

// 마이페이지 관련 컴포넌트
import ProfileEditForm from "../../components/MyPage/ProfileEditForm";
import RentalContainer from "../../components/MyPage/RentalContainer";
import PlotterContainer from "../../components/MyPage/PlotterContainer";
import RentalStatusBadge from "../../components/MyPage/RentalStatusBadge";
import TabSelector from "../../components/MyPage/TabSelector";

// 공통 컴포넌트
import Btn from "../../components/ui/Btn";
import InputField from "../../components/ui/InputField";
import NoticeBox from "../../components/ui/NoticeBox";
import PageHeader from "../../components/ui/PageHeader";
import SelectModal from "../../components/ui/SelectModal";

// 관리자 컴포넌트
import AdminRentalRow from "../../components/Admin/AdminRentalRow";
import AdminPlotterRow from "../../components/Admin/AdminPlotterRow";

export default function ComponentTest() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"rental" | "plotter" | "profile">("rental");
  const [selectOpen, setSelectOpen] = useState(false);

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-8 pt-8">
          {/* 타이틀 */}
          <PageHeader 
            title="컴포넌트 테스트"
            subtitle="플로터 및 마이페이지 관련 컴포넌트 케이스별 테스트"
          />

          <div className="space-y-16 mt-12">
            {/* ========== 플로터 관련 컴포넌트 ========== */}
            <section className="space-y-8">
              <h2 className="text-[32px] font-bold text-[#410f07] border-b-2 border-[#f72] pb-2">
                플로터 관련 컴포넌트
              </h2>

              {/* StatusBadge - 플로터 상태 */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">StatusBadge - 플로터 상태</h3>
                <div className="flex flex-wrap gap-4">
                  <StatusBadge status="waiting" />
                  <StatusBadge status="confirmed" />
                  <StatusBadge status="printing" />
                  <StatusBadge status="completed" />
                  <StatusBadge status="rejected" />
                </div>
              </div>

              {/* PlotterContainer */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">PlotterContainer</h3>
                <div className="space-y-4">
                  <PlotterContainer
                    status="waiting"
                    reservationNumber="PLOT-001"
                    applicationDate="2026-02-15"
                    title="대자보 플로터 인쇄"
                    printDate="2026-02-20"
                  />
                  <PlotterContainer
                    status="confirmed"
                    reservationNumber="PLOT-002"
                    applicationDate="2026-02-16"
                    title="포스터 인쇄"
                    printDate="2026-02-21"
                  />
                  <PlotterContainer
                    status="completed"
                    reservationNumber="PLOT-003"
                    applicationDate="2026-02-17"
                    title="현수막 인쇄"
                    printDate="2026-02-22"
                  />
                  <PlotterContainer
                    status="rejected"
                    reservationNumber="PLOT-004"
                    applicationDate="2026-02-18"
                    title="배너 인쇄"
                    printDate="2026-02-23"
                  />
                </div>
              </div>

              {/* PlotterRequestSummary */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">PlotterRequestSummary</h3>
                <div className="flex justify-center">
                  <PlotterRequestSummary
                    purpose="대자보 출력"
                    quantity={2}
                    expectedDate="2월 25일"
                    applicantName="홍길동"
                    studentNo="202112345"
                    phone="010-1234-5678"
                  />
                </div>
              </div>

              {/* ApplicationSummary */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">ApplicationSummary</h3>
                <div className="flex justify-center">
                  <ApplicationSummary
                    paperSize="A1(594 x 941mm)"
                    quantity={2}
                    expectedDate="2월 25일"
                    isFree={false}
                    totalAmount={10000}
                    onSubmit={() => alert("신청하기 클릭")}
                  />
                </div>
              </div>

              {/* FileUploadBox */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">FileUploadBox</h3>
                <FileUploadBox
                  label="인쇄 파일 (PDF)"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  file={pdfFile}
                  helperText="글꼴 깨짐 방지를 위해 PDF 포맷으로 업로드 해주세요"
                />
              </div>

              {/* PaymentProofBox */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">PaymentProofBox</h3>
                <PaymentProofBox
                  accountInfo={{
                    bank: "카카오뱅크",
                    accountNumber: "3333-00-1234567",
                    accountHolder: "정근녕"
                  }}
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  file={receiptFile}
                />
              </div>

              {/* PlotterFormFields */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">PlotterFormFields</h3>
                <PlotterFormFields
                  studentNo="202112345"
                  name="홍길동"
                  unit="학생복지위원회"
                  onUnitChange={() => {}}
                  phone="010-1234-5678"
                  purpose="대자보 출력"
                  onPurposeChange={() => {}}
                  paperSize="A1(594 x 941mm)"
                  onPaperSizeChange={() => {}}
                  quantity={1}
                  onQuantityChange={() => {}}
                />
              </div>
            </section>

            {/* ========== 마이페이지 관련 컴포넌트 ========== */}
            <section className="space-y-8">
              <h2 className="text-[32px] font-bold text-[#410f07] border-b-2 border-[#f72] pb-2">
                마이페이지 관련 컴포넌트
              </h2>

              {/* RentalStatusBadge */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">RentalStatusBadge - 대여 상태</h3>
                <div className="flex flex-wrap gap-4">
                  <RentalStatusBadge status="reserved" />
                  <RentalStatusBadge status="renting" />
                  <RentalStatusBadge status="returned" />
                  <RentalStatusBadge status="defective" />
                  <RentalStatusBadge status="canceled" />
                </div>
              </div>

              {/* TabSelector */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">TabSelector</h3>
                <TabSelector 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* RentalContainer */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">RentalContainer</h3>
                <div className="space-y-4">
                  <RentalContainer
                    status="reserved"
                    reservationNumber="RENT-001"
                    applicationDate="2026-02-15"
                    title="행사용 현수막"
                    itemCount={3}
                    startDate="2026-02-20"
                    endDate="2026-02-25"
                    totalCount={5}
                    onEdit={() => alert("수정 클릭")}
                    onCancel={() => alert("취소 클릭")}
                  />
                  <RentalContainer
                    status="renting"
                    reservationNumber="RENT-002"
                    applicationDate="2026-02-10"
                    title="DSLR 카메라"
                    itemCount={2}
                    startDate="2026-02-15"
                    endDate="2026-02-20"
                    totalCount={2}
                  />
                  <RentalContainer
                    status="returned"
                    reservationNumber="RENT-003"
                    applicationDate="2026-02-01"
                    title="프로젝터"
                    itemCount={1}
                    startDate="2026-02-05"
                    endDate="2026-02-10"
                    totalCount={1}
                  />
                  <RentalContainer
                    status="defective"
                    reservationNumber="RENT-004"
                    applicationDate="2026-01-20"
                    title="마이크 세트"
                    itemCount={4}
                    startDate="2026-01-25"
                    endDate="2026-01-30"
                    totalCount={4}
                  />
                  <RentalContainer
                    status="canceled"
                    reservationNumber="RENT-005"
                    applicationDate="2026-02-18"
                    title="스피커"
                    itemCount={2}
                    startDate="2026-02-22"
                    endDate="2026-02-27"
                    totalCount={2}
                  />
                </div>
              </div>

              {/* ProfileEditForm */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">ProfileEditForm</h3>
                <div className="flex justify-center">
                  <ProfileEditForm
                    userId="202112345"
                    initialDepartment="학생복지위원회"
                    onUpdate={(data) => console.log("프로필 수정:", data)}
                    onDelete={(password) => console.log("회원 탈퇴:", password)}
                  />
                </div>
              </div>
            </section>

            {/* ========== 공통 컴포넌트 ========== */}
            <section className="space-y-8">
              <h2 className="text-[32px] font-bold text-[#410f07] border-b-2 border-[#f72] pb-2">
                공통 컴포넌트
              </h2>

              {/* Btn */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">Btn</h3>
                <div className="flex flex-wrap gap-4">
                  <Btn text="기본 버튼" onClick={() => alert("클릭!")} />
                  <Btn text="커스텀 스타일" onClick={() => {}} className="bg-blue-500 text-white" />
                </div>
              </div>

              {/* InputField */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">InputField</h3>
                <div className="space-y-4 max-w-[500px]">
                  <InputField value="202112345" disabled />
                  <InputField value="" placeholder="입력 가능한 필드" onChange={() => {}} />
                </div>
              </div>

              {/* SelectModal */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">SelectModal</h3>
                <div className="max-w-[500px]">
                  <SelectModal
                    text="학생복지위원회"
                    isOpen={selectOpen}
                    onToggle={() => setSelectOpen(!selectOpen)}
                  />
                </div>
              </div>

              {/* NoticeBox */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">NoticeBox</h3>
                <NoticeBox
                  items={[
                    "출력물은 근무일 기준 2일 이후에 수령할 수 있습니다.",
                    "주말 및 공휴일은 인쇄 작업이 진행되지 않습니다.",
                    "파일은 PDF 형식으로 업로드해주세요."
                  ]}
                />
              </div>

              {/* PageHeader */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">PageHeader</h3>
                <PageHeader 
                  title="페이지 타이틀"
                  subtitle="페이지에 대한 설명이 들어갑니다."
                />
              </div>
            </section>

            {/* ========== 관리자 컴포넌트 ========== */}
            <section className="space-y-8">
              <h2 className="text-[32px] font-bold text-[#410f07] border-b-2 border-[#f72] pb-2">
                관리자 컴포넌트
              </h2>

              {/* AdminRentalRow */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">AdminRentalRow - 대여 관리 행</h3>
                <div className="space-y-0 border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <AdminRentalRow
                    rentalCode="2026-R1"
                    userName="김도은"
                    department="학생복지위원회"
                    itemName="행사용 천막"
                    startDate="2026-02-10"
                    endDate="2026-02-12"
                    status="reserved"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminRentalRow
                    rentalCode="2026-R2"
                    userName="이준호"
                    department="총학생회"
                    itemName="DSLR 카메라"
                    startDate="2026-02-15"
                    endDate="2026-02-20"
                    status="renting"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminRentalRow
                    rentalCode="2026-R3"
                    userName="박서영"
                    department="동아리연합회"
                    itemName="프로젝터"
                    startDate="2026-02-05"
                    endDate="2026-02-10"
                    status="returned"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminRentalRow
                    rentalCode="2026-R4"
                    userName="최민수"
                    department="학과 학생회"
                    itemName="마이크 세트"
                    startDate="2026-01-25"
                    endDate="2026-02-15"
                    status="overdue"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminRentalRow
                    rentalCode="2026-R5"
                    userName="정하늘"
                    department="학생복지위원회"
                    itemName="스피커"
                    startDate="2026-02-22"
                    endDate="2026-02-27"
                    status="canceled"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                </div>
              </div>

              {/* AdminPlotterRow */}
              <div className="bg-white rounded-[20px] p-6 shadow-md">
                <h3 className="text-[24px] font-bold text-[#410f07] mb-4">AdminPlotterRow - 플로터 관리 행</h3>
                <div className="space-y-0 border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <AdminPlotterRow
                    orderCode="2026-P1"
                    userName="전건호"
                    club="너드더락"
                    purpose="공연 포스터"
                    paperSizeAndCount="A3 /5장"
                    orderDate="2026-02-10"
                    status="pending"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminPlotterRow
                    orderCode="2026-P2"
                    userName="김하늘"
                    club="학생복지위원회"
                    purpose="행사 배너"
                    paperSizeAndCount="A1 /2장"
                    orderDate="2026-02-12"
                    status="confirmed"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminPlotterRow
                    orderCode="2026-P3"
                    userName="이수진"
                    club="동아리연합회"
                    purpose="안내 포스터"
                    paperSizeAndCount="A2 /3장"
                    orderDate="2026-02-08"
                    status="printed"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminPlotterRow
                    orderCode="2026-P4"
                    userName="박준호"
                    club="총학생회"
                    purpose="축제 홍보물"
                    paperSizeAndCount="A0 /1장"
                    orderDate="2026-02-05"
                    status="rejected"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                  <AdminPlotterRow
                    orderCode="2026-P5"
                    userName="최민서"
                    club="학과 학생회"
                    purpose="졸업 작품"
                    paperSizeAndCount="A1 /4장"
                    orderDate="2026-02-01"
                    status="completed"
                    onStatusChange={(newStatus) => alert(`상태 변경: ${newStatus}`)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
