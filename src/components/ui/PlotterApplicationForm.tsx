import { useState } from 'react';
import InputField from './InputField';
import SelectModal from './SelectModal';

interface PlotterApplicationFormProps {
  studentId?: string;
  name?: string;
  phone?: string;
  className?: string;
}

const PlotterApplicationForm = ({
  studentId = '202112345',
  name = '홍길동',
  phone = '010-1234-5678',
  className = '',
}: PlotterApplicationFormProps) => {
  const [organization, setOrganization] = useState('학생복지위원회');
  const [orgOpen, setOrgOpen] = useState(false);
  
  const [purpose, setPurpose] = useState('대자보 출력');
  const [purposeOpen, setPurposeOpen] = useState(false);
  
  const [paperSize, setPaperSize] = useState('A1(594 x 941mm)');
  const [paperOpen, setPaperOpen] = useState(false);
  
  const [printCount, setPrintCount] = useState('1');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  return (
    <div className={`bg-white rounded-[27px] w-[764px] p-8 ${className}`}>
      {/* 제목 */}
      <div className="flex items-center gap-3 mb-8">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M27 4.5H13.5C12.7044 4.5 11.9413 4.81607 11.3787 5.37868C10.8161 5.94129 10.5 6.70435 10.5 7.5V28.5C10.5 29.2956 10.8161 30.0587 11.3787 30.6213C11.9413 31.1839 12.7044 31.5 13.5 31.5H27C27.7956 31.5 28.5587 31.1839 29.1213 30.6213C29.6839 30.0587 30 29.2956 30 28.5V7.5C30 6.70435 29.6839 5.94129 29.1213 5.37868C28.5587 4.81607 27.7956 4.5 27 4.5Z" stroke="#FF7755" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 13.5H24" stroke="#FF7755" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 19.5H24" stroke="#FF7755" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 25.5H24" stroke="#FF7755" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2
          className="text-[32px] font-medium text-[#410f07]"
          style={{
            fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
            letterSpacing: '-0.64px',
          }}
        >
          신청 정보 입력
        </h2>
      </div>

      {/* 학번 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">학번</label>
        <InputField
          value={studentId}
          disabled
          className="w-[665px]"
        />
      </div>

      {/* 이름 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">이름</label>
        <InputField
          value={name}
          disabled
          className="w-[663px]"
        />
      </div>

      {/* 소속 단위 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">소속 단위</label>
        <SelectModal
          text={organization}
          isOpen={orgOpen}
          onToggle={() => setOrgOpen(!orgOpen)}
          className="w-[663px]"
        />
      </div>

      {/* 전화번호 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">전화번호</label>
        <InputField
          value={phone}
          disabled
          className="w-[663px]"
        />
      </div>

      {/* 목적 */}
      <div className="mb-6">
        <label className="block text-[20px] font-medium text-black mb-2">목적</label>
        <SelectModal
          text={purpose}
          isOpen={purposeOpen}
          onToggle={() => setPurposeOpen(!purposeOpen)}
          className="w-[663px]"
        />
      </div>

      {/* 용지 크기 & 인쇄 장수 */}
      <div className="flex gap-6 mb-6">
        <div className="flex-1">
          <label className="block text-[20px] font-medium text-black mb-2">용지 크기</label>
          <SelectModal
            text={paperSize}
            isOpen={paperOpen}
            onToggle={() => setPaperOpen(!paperOpen)}
            className="w-[311px]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[20px] font-medium text-black mb-2">인쇄 장수</label>
          <div className="flex items-center gap-2">
            <InputField
              value={printCount}
              onChange={(e) => setPrintCount(e.target.value)}
              type="number"
              className="w-[268px]"
            />
            <span className="text-[35px] font-medium text-black">장</span>
          </div>
        </div>
      </div>

      {/* 인쇄 파일 (PDF) */}
      <div className="mb-2">
        <label className="block text-[20px] font-medium text-black mb-2">인쇄 파일 (PDF)</label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex flex-col items-center justify-center w-[663px] h-[145px] border border-[#99a1af] border-dashed rounded-[10px] bg-white cursor-pointer hover:bg-gray-50"
          >
            <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 30.458V12.5417M21.5 12.5417L13.5833 20.4583M21.5 12.5417L29.4167 20.4583M37.3333 30.458V34.2083C37.3333 35.1418 36.9625 36.0371 36.3029 36.6966C35.6434 37.3562 34.7481 37.7271 33.8146 37.7271H9.18542C8.25189 37.7271 7.35659 37.3562 6.69708 36.6966C6.03758 36.0371 5.66667 35.1418 5.66667 34.2083V30.458" stroke="#868686" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="mt-2 text-[15px] font-medium text-[#868686]">
              PDF 파일을 이곳에 드래그 하거나 클릭하세요
            </p>
            <div className="mt-2 bg-white border-[0.5px] border-[#a4a4a4] rounded-[6px] px-4 py-1">
              <span className="text-[15px] font-medium text-[#868686]">파일 선택</span>
            </div>
          </label>
          {pdfFile && (
            <p className="mt-2 text-[15px] text-[#410f07]">선택된 파일: {pdfFile.name}</p>
          )}
        </div>
        <ul className="mt-2 ml-4 text-[15px] text-[#b1b1b1]">
          <li className="list-disc">글꼴 깨짐 방지를 위해 PDF 포맷으로 업로드 해주세요</li>
        </ul>
      </div>

      {/* 입금 내역 증빙 */}
      <div className="mt-6">
        <div className="bg-[#fff3e5] border border-[#99a1af] border-dashed rounded-[10px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 4H2C1.44772 4 1 4.44772 1 5V11C1 11.5523 1.44772 12 2 12H14C14.5523 12 15 11.5523 15 11V5C15 4.44772 14.5523 4 14 4Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 7H15" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[20px] font-medium text-black">입금 내역 증빙</span>
          </div>
          
          <div className="mb-4 text-[20px] font-medium">
            <p className="text-[#606060]">
              입금 계좌: <span className="text-[#ff7755]">카카오뱅크 3333-00-1234567 (정근녕)</span>
            </p>
            <p className="text-[#606060]">
              입금자명: 본인 이름으로 입금해주세요.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="hidden"
              id="proof-upload"
            />
            <label
              htmlFor="proof-upload"
              className="bg-[#fccc96] rounded-[19px] px-5 py-1.5 cursor-pointer hover:bg-[#fbb87d]"
            >
              <span className="text-[15px] font-medium text-[#ff7755]">파일 선택</span>
            </label>
            <span className="text-[20px] font-medium text-[#bababa]">
              {proofFile ? proofFile.name : '선택된 파일 없음'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotterApplicationForm;
