import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Btn from "../../components/ui/Btn";
import SelectModal from "../../components/ui/SelectModal";
import InputField from "../../components/ui/InputField";
import StatusBadge from "../../components/ui/StatusBadge";
import RentalStatusBadge from "../../components/ui/RentalStatusBadge";
import TabSelector from "../../components/ui/TabSelector";
import RentalContainer from "../../components/ui/RentalContainer";
import PlotterContainer from "../../components/ui/PlotterContainer";
import PlotterApplicationForm from "../../components/ui/PlotterApplicationForm";

export default function PlotterTest() {
  const [textValue, setTextValue] = useState("1");
  const [passwordValue, setPasswordValue] = useState("password123");
  const [activeTab, setActiveTab] = useState<'rental' | 'plotter' | 'profile'>('rental');

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-4 pt-16">
          {/* 페이지 타이틀 */}
          <div className="text-center mb-12">
            <h1 className="text-[50px] font-bold text-[#410f07] mb-4">
              컴포넌트 테스트
            </h1>
          </div>

          {/* 버튼 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              1. 홈으로 돌아가기 버튼
            </h2>
            <div className="space-y-4">
              <Btn 
                text="홈으로 돌아가기" 
                className="w-[663px]"
              />
              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 663px × 63px</p>
                <p>• 배경색: #FF7755</p>
                <p>• 그림자: 0px 4px 4px rgba(0,0,0,0.25)</p>
                <p>• 텍스트: 24px, 볼드, 흰색</p>
              </div>
            </div>
          </div>

          {/* 탭 셀렉터 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              2. 탭 셀렉터
            </h2>
            <div className="space-y-4">
              <TabSelector 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="w-[879px]"
              />
              <div className="text-gray-600 text-sm mt-4">
                <p>• 전체 크기: 879px × 94px (293px × 3개)</p>
                <p>• 각 탭: 293px × 94px</p>
                <p>• 활성화: #ff7755 배경, 위쪽 둥근 모서리 10px</p>
                <p>• 비활성화: #efefef 배경</p>
                <p>• 텍스트: 30px, Medium, #410f07</p>
                <p>• 현재 선택된 탭: {activeTab}</p>
              </div>
            </div>
          </div>

          {/* 셀렉트 모달 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              3. 셀렉트 모달 (드롭다운)
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">활성화 상태 (클릭 시 화살표 회전)</p>
                <SelectModal 
                  text="학생복지위원회" 
                  className="w-[663px]"
                />
              </div>
              
              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">비활성화 상태</p>
                <SelectModal 
                  text="학생복지위원회" 
                  disabled
                  className="w-[663px]"
                />
              </div>

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 663px × 71px</p>
                <p>• 활성화: 흰색 배경, 검정 텍스트</p>
                <p>• 비활성화: #efefef 배경, #afafaf 텍스트</p>
                <p>• 테두리: #99a1af</p>
                <p>• 텍스트: 20px, Medium</p>
                <p>• 클릭 시 화살표 180도 회전</p>
              </div>
            </div>
          </div>

          {/* 입력창 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              4. 입력창
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">활성화 상태</p>
                <InputField 
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="텍스트를 입력하세요"
                  className="w-[663px]"
                />
              </div>
              
              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">비활성화 상태</p>
                <InputField 
                  value="1"
                  disabled
                  className="w-[663px]"
                />
              </div>

              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">패스워드 타입 (활성화)</p>
                <InputField 
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-[663px]"
                />
              </div>

              <div>
                <p className="text-[18px] font-semibold text-[#410f07] mb-2">패스워드 타입 (비활성화)</p>
                <InputField 
                  type="password"
                  value="password123"
                  disabled
                  className="w-[663px]"
                />
              </div>

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 663px × 71px</p>
                <p>• 활성화: 흰색 배경, 검정 텍스트, #99a1af 테두리</p>
                <p>• 비활성화: #efefef 배경, #afafaf 텍스트</p>
                <p>• 텍스트: 20px</p>
                <p>• 패스워드 타입: 입력값을 * 로 표시</p>
              </div>
            </div>
          </div>

          {/* 상태 뱃지 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              5. 상태 뱃지 (플로터)
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <StatusBadge status="waiting" />
                <StatusBadge status="confirmed" />
                <StatusBadge status="printing" />
                <StatusBadge status="completed" />
                <StatusBadge status="rejected" />
              </div>

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 97px × 33px (가변 너비)</p>
                <p>• 둥근 모서리: 11px</p>
                <p>• 텍스트: 15px, Medium</p>
                <p>• 예약 대기: #f54a00 텍스트, #fdd297 배경</p>
                <p>• 예약 확정: #155dfc 텍스트, #97f2fd 배경</p>
                <p>• 인쇄 완료: #1b811f 텍스트, #a9ffca 배경</p>
                <p>• 수령 완료: #4a5565 텍스트, #ddd 배경</p>
                <p>• 예약 반려: red 텍스트, #ffa2a2 배경</p>
              </div>
            </div>
          </div>

          {/* 대여 상태 뱃지 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              6. 상태 뱃지 (대여)
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <RentalStatusBadge status="reserved" />
                <RentalStatusBadge status="renting" />
                <RentalStatusBadge status="returned" />
                <RentalStatusBadge status="defective" />
                <RentalStatusBadge status="canceled" />
              </div>

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 97px × 33px (가변 너비)</p>
                <p>• 둥근 모서리: 11px</p>
                <p>• 텍스트: 15px, Medium</p>
                <p>• 예약: #f54a00 텍스트, #fdd297 배경</p>
                <p>• 대여 중: #1b811f 텍스트, #a9ffca 배경</p>
                <p>• 정상 반납: #4a5565 텍스트, #ddd 배경</p>
                <p>• 불량 반납: red 텍스트, #ffa2a2 배경</p>
                <p>• 예약 취소: #ffae00 텍스트, #fcff9c 배경</p>
              </div>
            </div>
          </div>

          {/* 대여 컨테이너 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              7. 대여 컨테이너
            </h2>
            <div className="space-y-4">
              <RentalContainer
                status="reserved"
                reservationNumber="HBW-202612345"
                applicationDate="2026-01-05"
                title="행사용 현수막"
                itemCount={0}
                startDate="2026-01-10"
                endDate="2026-01-14"
                totalCount={1}
                onEdit={() => alert('수정 클릭')}
                onCancel={() => alert('예약 취소 클릭')}
              />

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 1091px × 149px</p>
                <p>• 테두리: #b9b9b9, 둥근 모서리 21px</p>
                <p>• 상태 뱃지: RentalStatusBadge 컴포넌트 사용</p>
                <p>• 제목: 32px, SemiBold, #410f07</p>
                <p>• 예약 번호 & 신청일: 13px, Light, #919191</p>
                <p>• 날짜 정보: 15px, Medium, #5b5b5b</p>
                <p>• 수정 버튼: 93px × 49px, 흰색 배경, #a4a4a4 테두리</p>
                <p>• 예약 취소 버튼: 134px × 49px, #ffd2d2 배경, #ff5151 테두리</p>
              </div>
            </div>
          </div>

          {/* 플로터 컨테이너 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              8. 플로터 컨테이너
            </h2>
            <div className="space-y-4">
              <PlotterContainer
                status="waiting"
                reservationNumber="HBW-202612345"
                applicationDate="2026-01-05"
                title="대자보 플로터 인쇄"
                printDate="2026-01-14"
              />

              <div className="text-gray-600 text-sm mt-4">
                <p>• 크기: 1091px × 149px</p>
                <p>• 테두리: #b9b9b9, 둥근 모서리 21px</p>
                <p>• 상태 뱃지: StatusBadge 컴포넌트 사용 (플로터용)</p>
                <p>• 제목: 32px, SemiBold, #410f07</p>
                <p>• 예약 번호 & 신청일: 13px, Light, #919191</p>
                <p>• 날짜 정보: 15px, Medium, #5b5b5b</p>
                <p>• 버튼 없음 (대여와의 차이점)</p>
              </div>
            </div>
          </div>

          {/* 플로터 신청 폼 테스트 */}
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-8">
            <h2 className="text-[30px] font-bold text-[#410f07] mb-6">
              9. 플로터 신청정보 입력 폼
            </h2>
            <div className="space-y-4">
              <PlotterApplicationForm />

              <div className="text-gray-600 text-sm mt-4">
                <p>• 전체 크기: 764px × 1330px</p>
                <p>• InputField, SelectModal 컴포넌트 사용</p>
                <p>• 학번, 이름, 전화번호: 비활성화 입력필드</p>
                <p>• 소속 단위, 목적, 용지 크기: 셀렉트 모달</p>
                <p>• 인쇄 장수: 숫자 입력필드 + "장" 텍스트</p>
                <p>• PDF 파일 업로드: 점선 테두리 영역</p>
                <p>• 입금 내역 증빙: 주황색 배경 (#fff3e5) + 파일 선택 버튼</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
